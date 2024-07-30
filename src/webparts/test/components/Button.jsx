import React from 'react'
import './style.css'

function Button(props) {

    const {BtnValue} = props;

  return (
    
    <button>{BtnValue}</button>
  )
}

export default Button