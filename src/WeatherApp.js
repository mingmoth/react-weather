import React from 'react'
import styled from "@emotion/styled"

const WeatherCard = styled.div`
    position: relative;
    min-width: 360px;
    box-shadow: 0 1px 3px 0 #999999;
    background-color: #f9f9f9;
    box-sizing: border-box;
    padding: 30px 15px;
    text-align: start;
  `

const WeatherApp = () => {

  return (
    <WeatherCard>
      <h1>Weather</h1>
    </WeatherCard>
  )
}

export default WeatherApp