import React, { useState, useEffect, useCallback } from 'react'
import styled from "@emotion/styled"

import { ReactComponent as CloudyIcon } from './assets/images/day-cloudy.svg';
import { ReactComponent as AirFlowIcon } from './assets/images/airFlow.svg';
import { ReactComponent as RainIcon } from './assets/images/rain.svg';
import { ReactComponent as RedoIcon } from './assets/images/refresh.svg';

const WeatherCard = styled.div`
    position: relative;
    min-width: 360px;
    box-shadow: 0 1px 3px 0 #999999;
    background-color: #f9f9f9;
    box-sizing: border-box;
    padding: 30px 15px;
    text-align: start;
    `
const Location = styled.div`
  font-size: 28px;
  color: #212121;
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: #828282;
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: #757575;
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: #828282;
  margin-bottom: 20px;
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: #828282;
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Redo = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: #828282;

  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
`
const fetchCurrentWeather = () => {
  return fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-0EFE490A-BF4C-40C8-9056-C7A2A29AC6FF&locationName=臺北')
    .then(response => response.json())
    .then(data => {
      const locationData = data.records.location[0]
      const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
        if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
          neededElements[item.elementName] = item.elementValue
        }
        return neededElements
      }, {})
      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD,
      }
    })
}
const fetchWeatherForecast = () => {
  return fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-0EFE490A-BF4C-40C8-9056-C7A2A29AC6FF&locationName=臺北市')
    .then(response => response.json())
    .then(data => {
      const locationData = data.records.location[0]
      const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
        neededElements[item.elementName] = item.time[0].parameter
        return neededElements
      }, {})


      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      }


    })
}

const WeatherApp = () => {
  const [weatherItem, setWeatherItem] = useState({
    observationTime: new Date(),
    locationName: '',
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: '',
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: '',
  })

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast(),
      ])
      setWeatherItem({
        ...currentWeather,
        ...weatherForecast
      })
    }
    fetchingData()
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  return (
    <WeatherCard>
      <Location>{weatherItem.locationName}</Location>
      <Description>{weatherItem.description} {weatherItem.comfortability}</Description>
      <CurrentWeather>
        <Temperature>
          {weatherItem.temperature} <Celsius>°C</Celsius>
        </Temperature>
        <CloudyIcon />
      </CurrentWeather>
      <AirFlow>
        <AirFlowIcon />
        {weatherItem.windSpeed} m/h
      </AirFlow>
      <Rain><RainIcon />{Math.round(weatherItem.rainPossibility * 100)}%</Rain>
      <Redo>
        最後觀測時間：
        {new Intl.DateTimeFormat('zh-TW', {
          hour: 'numeric',
          minute: 'numeric',
        }).format(new Date(weatherItem.observationTime))}{' '}
        <RedoIcon onClick={fetchData} />
      </Redo >
    </WeatherCard>
  )
}

export default WeatherApp