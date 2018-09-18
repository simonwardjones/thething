import React, {  Component } from 'react';
import {Card, CardBody, CardText} from 'reactstrap'
import './ThingItems.scss'
import SubItems from './SubItems.js'

class ThingItems extends Component {
  constructor(props) {
    super(props);
    this.handleSubClick = this.handleSubClick.bind(this)
  }

  handleClick(i,y, event){
    console.log('click fired',i,y, event)
    this.props.handleClick(i,y, event)
  }

  handleSubClick(i,y,sub,event) {
    console.log('subclick fired',i,y, event, sub)
    this.props.handleSubClick(i,y,sub, event)
  }

  render() {
    const thing_items = this.props.items.map((item) => {
      return (
      <Card 
      year={this.props.year} 
      key={item.item_number} 
      onClick={!(item.subitems) ? this.handleClick.bind(this,item.item_number, item.year) : null}
      className={item.complete ? "completed" : ""}>
        <CardBody >
        <CardText >{item.item_number +". "+item.name}</CardText>
        {item.subitems ? <SubItems subitems={item.subitems} 
                                   item={item.item_number}
                                   handleClick={this.handleSubClick}
                                    /> : ""}
        </CardBody>
      </Card> 
      ) 
    })
    return (
      <div>
      <div className="card-columns">
        {thing_items}
      </div>
      </div>
    );
  }
}

export default ThingItems;
