import React from 'react'
import {
  Form,
  FormGroup,
  FormControl,
  Checkbox,
  Radio,
  Button,
  Panel,
  Grid,
  Row,
  Col,
  ControlLabel,
  Nav,
  NavItem
} from 'react-bootstrap'
import { Redirect } from 'react-router-dom'

import axios from 'axios'
import _ from 'lodash'
import { connect } from 'react-redux'
import Promise from 'bluebird'

import ContentWrapper from '~/components/Layout/ContentWrapper'
import PageHeader from '~/components/Layout/PageHeader'
import ModulesComponent from '~/components/Modules'

import { fetchModules } from '~/actions'

export default class DashboardView extends React.Component {
  state = {
    loading: true,
    settingsByModule: {},
    currentSettings: {},
    isChanged: false
  }

  componentDidMount() {
    axios
      .get('/api/settings')
      .then(({ data }) => {
        this.setState({ settingsByModule: data })
        this.setCurrentModuleSettings(data, this.props.location)
      })
      .finally(() => this.setState({ loading: false }))
  }

  componentWillReceiveProps(nextProps) {
    this.setCurrentModuleSettings(this.state.settingsByModule, nextProps.location)
  }

  setCurrentModuleSettings(settingsByModule, location) {
    this.setState({ currentSettings: settingsByModule[this.currentModuleName(location)], isChanged: false })
  }

  renderInput(setting, settingName) {
    const updateState = normalizer => ({ target }) => {
      const value = normalizer ? normalizer(target) : target.value
      const settings = this.state.currentSettings
      return this.setState({
        currentSettings: { ...settings, [settingName]: { ...settings[settingName], value } },
        isChanged: true
      })
    }

    if (setting.type === 'bool') {
      return (
        <Checkbox
          onChange={updateState(({ checked }) => checked)}
          checked={this.state.currentSettings[settingName].value}
        >
          {settingName}
        </Checkbox>
      )
    } else if (setting.type === 'choice') {
      return setting.validation.map(validOption => (
        <Radio
          key={validOption}
          value={validOption}
          onChange={updateState()}
          checked={this.state.currentSettings[settingName].value === validOption}
        >
          {validOption}
        </Radio>
      ))
    } else if (setting.type === 'number') {
      return (
        <FormControl
          type="number"
          placeholder={setting.default || ''}
          value={this.state.currentSettings[settingName].value || ''}
          onChange={updateState(({ value }) => Number(value))}
        />
      )
    } else {
      return (
        <FormControl
          type="text"
          value={this.state.currentSettings[settingName].value || ''}
          placeholder={String(setting.default || '')}
          onChange={updateState()}
        />
      )
    }
  }

  currentModuleName = location => location.hash.substring(1)

  handleSave = e => {
    e.preventDefault()
    const settingPairs = _.map(this.state.currentSettings, ({ value }, settingName) => [settingName, value || null])
    axios
      .post(`/api/settings/${this.currentModuleName(this.props.location)}`, _.fromPairs(settingPairs))
      .then(() => this.setState({ isChanged: false }))
  }

  render() {
    const { settingsByModule, currentSettings, isChanged, loading } = this.state
    if (loading) {
      return null
    }

    if (!settingsByModule[this.currentModuleName(this.props.location)]) {
      return <Redirect to="/settings#core" />
    }

    return (
      <Grid fluid>
        <PageHeader>
          <span>Settings</span>
        </PageHeader>
        <Row>
          <Col xs={3} md={2}>
            <Nav bsStyle="pills" stacked style={{ marginTop: '20px' }}>
              {_.map(settingsByModule, (currentSettings, moduleName) => (
                <NavItem key={moduleName} href={`/settings#${moduleName}`} active={location.hash === `#${moduleName}`}>
                  {moduleName}
                </NavItem>
              ))}
            </Nav>
          </Col>
          <Col xs={9} md={10}>
            <ContentWrapper>
              <Panel>
                <Panel.Body>
                  {Object.keys(currentSettings).length === 0 ? (
                    'No editable settings found for this module'
                  ) : (
                    <Form horizontal onSubmit={this.handleSave}>
                      {_.map(currentSettings, (setting, settingName) => (
                        <FormGroup key={settingName} controlId={`formHorizontal${setting}`}>
                          <Col componentClass={ControlLabel} md={3} style={{ wordWrap: 'break-word' }}>
                            {setting.type === 'bool' ? null : `${settingName}${setting.required ? ' *' : ''}`}
                          </Col>
                          <Col md={9}>{this.renderInput(setting, settingName)}</Col>
                        </FormGroup>
                      ))}
                      <FormGroup>
                        <Col mdOffset={3} md={9}>
                          <Button type="submit" disabled={!isChanged}>
                            Save {/*TODO: Should be Save & Restart Bot*/}
                          </Button>
                        </Col>
                      </FormGroup>
                    </Form>
                  )}
                </Panel.Body>
              </Panel>
            </ContentWrapper>
          </Col>
        </Row>
      </Grid>
    )
  }
}
