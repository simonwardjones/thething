import React, { Component } from 'react';
import thething_2017 from './thething_2017.json'
import thething_2018 from './thething_2018.json'
import ThingItems from './ThingItems.js'
import { Nav, NavItem, NavLink} from 'reactstrap'
import { TabPane, TabContent, Jumbotron, Container, Col,  Row} from 'reactstrap'
import classnames from 'classnames';
import './App.css';
import aws  from 'aws-sdk'

aws.config.update({"region": "us-east-1"})
aws.config.credentials = new aws.CognitoIdentityCredentials({
IdentityPoolId: "us-east-1:f647de6c-db06-4c04-b1e9-eb6a53042703",
RoleArn: "arn:aws:iam::044248571300:role/Cognito_DynamoPoolUnauth"
});
//this actually gets credentials
aws.config.credentials.get()

var dynamodb = new aws.DynamoDB.DocumentClient();

function logme(err,data) {
    console.log(data)
}


// module.exports.GOP =  get_all_items_in_year
// module.exports.toggle_specific_item = toggle_specific_item


class App extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      total_score_2017: "",
      total_score_2018: "",
      activeTab: '1',
      items_2017: [],
      items_2018: []
    };
    this.get_all_items_in_year = this.get_all_items_in_year.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.updateTotal2017 = this.updateTotal2017.bind(this)
    this.handleSubClick = this.handleSubClick.bind(this)
    this.checkAllSubItems = this.checkAllSubItems.bind(this)
  }

  get_all_items_in_year(year){
      year = Number(year)
      var p = {
          TableName: "thething",
          KeyConditionExpression: '#y = :y',
          ExpressionAttributeValues: {
          ":y": year
              },
          ExpressionAttributeNames: {
          "#y": "year"
          }
      }
      dynamodb.query(p,(err, data) => {
        var key_name = "items_"+year
        this.setState({[key_name]: data.Items}, () => {
          this.updateTotal2017()
          this.updateTotal2018()
        })
      })
  }

  componentDidMount() {
    var items_2017 = this.get_all_items_in_year(2017)
    var items_2018 = this.get_all_items_in_year(2018)
  }

  updateTotal2017(){
    var total = this.state.items_2017.length
    var complete = this.state.items_2017.filter((item) => item.complete).length
    this.setState({total_score_2017: complete + "/" + total})
  }
  updateTotal2018(){
    var total = this.state.items_2018.length
    var complete = this.state.items_2018.filter((item) => item.complete).length
    this.setState({total_score_2018: complete + "/" + total})
  }
  handleClick(i,y,sub,event) {
    console.log("SUB",sub)
    var key_name = "items_"+y
    let items = this.state[key_name]
    var current_item = items.find(function(element){ 
      return element.item_number == i})
    current_item.complete = !current_item.complete
    console.log(current_item)
    var p = {
      TableName: "thething",
      Key:{
          "year": current_item.year,
          "item_number": current_item.item_number
      },
      UpdateExpression: "set complete = :val",
      ExpressionAttributeValues:{
          ":val": current_item.complete
      },
      ReturnValues:"UPDATED_NEW"
      };
    dynamodb.update(p, (err,data) => {
        console.log("Updatade",data)
        this.setState({items: items})
        this.updateTotal2017()
        this.updateTotal2018()
    } )
  }

  checkAllSubItems(item){
    var t = item.subitems.map((sub) => sub.complete)
    return t.every(Boolean);
  }

  handleSubClick(i,y,sub,event) {
    var key_name = "items_"+y
    console.log('state',this.state)
    let items = this.state[key_name]
    var current_item = items.find(function(element){ 
      return element.item_number == i})
    var current_sub_item = current_item.subitems[sub-1]
    current_sub_item.complete = !current_sub_item.complete
    var check_all_sub_items= this.checkAllSubItems(current_item)
    current_item.complete = check_all_sub_items;
    console.log('allsubitems?',check_all_sub_items)
    var p = {
      TableName: "thething",
      Key:{
          "year": current_item.year,
          "item_number": current_item.item_number
      },
      UpdateExpression: "set subitems["+(sub-1)+"].complete = :val, complete=:all",
      ExpressionAttributeValues:{
          ":val": current_sub_item.complete,
          ":all": check_all_sub_items
      },
      ReturnValues:"UPDATED_NEW"
      };
    dynamodb.update(p, (err,data) => {
        console.log("Updatade",data)
        this.setState({items: items})
        this.updateTotal2017()
        this.updateTotal2018()

    }

    )
  }
  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }


  render() {
    return (
      <div>
      <Jumbotron>
          <Container>
            <Row>
            <Col>
            <h1> The Thing </h1>
            </Col>
            </Row>
          </Container>
      </Jumbotron>

      <Container>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => { this.toggle('1'); }}
            >
              2017 - {this.state.total_score_2017}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              2018 - {this.state.total_score_2018}
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <Container>
              <Row>
                <Col xs="12">
                  <ThingItems items={this.state.items_2017}
                              handleClick={this.handleClick} 
                              handleSubClick={this.handleSubClick}
                              year="2017"/>
                </Col>
              </Row>
            </Container>
          </TabPane>
          <TabPane tabId="2">
            <Container>
              <Row>
                <Col xs="12">
                  <ThingItems items={this.state.items_2018} 
                              handleClick={this.handleClick}
                              handleSubClick={this.handleSubClick}
                              year="2018"/>
                </Col>
              </Row>
            </Container>
          </TabPane>
        </TabContent>
      </Container>
      </div>
    );
  }
}

export default App;
