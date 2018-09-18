import React, {  Component } from 'react';
import {Card, CardBody, CardText} from 'reactstrap'
import './SubItems.scss'


class SubItems extends Component {

  handleClick(i,y,sub, event){
    // console.log(i,y, sub, event)
    this.props.handleClick(i,y,sub, event)
  }

  render() {
    const sub_items = this.props.subitems.map((subitem) => {
      return (
      <Card 
      key={subitem.name}
      onClick={this.handleClick.bind(this,this.props.item,subitem.year,subitem.item_number)}
      className={subitem.complete ? "completed" : ""}>
        <CardBody >
        <CardText >{subitem.name}</CardText>
        </CardBody>
      </Card> 
      ) 
    })
    return (
      <div className="sub_items">
                {sub_items}
      </div>
    );
  }
}

export default SubItems;
