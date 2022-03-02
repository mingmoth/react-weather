import React from 'react'
import styled from "@emotion/styled"

import WeatherIcon from './WeatherIcon'

import { ReactComponent as AirFlowIcon } from '../assets/images/airFlow.svg';
import { ReactComponent as RainIcon } from '../assets/images/rain.svg';
import { ReactComponent as RefreshIcon } from '../assets/images/refresh.svg';
import { ReactComponent as LoadingIcon } from '../assets/images/loading.svg';

const WeatherCardWrapper = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  background-color: ${({ theme }) => theme.foregroundColor};
  box-sizing: border-box;
  padding: 30px 15px;
  text-align: start;
`

const Location = styled.div`
  font-size: 28px;
  color: ${({ theme }) => theme.titleColor};
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: ${({ theme }) => theme.temperatureColor};
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
  color: ${({ theme }) => theme.textColor};
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
  color: ${({ theme }) => theme.textColor};
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Refresh = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({ theme }) => theme.textColor};

  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    animation: rotate infinite 1.5s linear;
    animation-duration: ${({ isLoading }) => (isLoading ? '1.5s' : '0s')};
  }
  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
`

const WeatherCard = ({ theme, currentMode, weatherItem, fetchData }) => {
  const {
    observationTime,
    locationName,
    temperature,
    windSpeed,
    description,
    weatherCode,
    rainPossibility,
    comfortability,
    isLoading,
    moment,
  } = weatherItem
  return (
    <WeatherCardWrapper theme={theme[currentMode]}>
      <Location theme={theme[currentMode]}>{locationName}</Location>
      <Description theme={theme[currentMode]}>{description} {comfortability}</Description>
      <CurrentWeather theme={theme[currentMode]}>
        <Temperature theme={theme[currentMode]}>
          {Math.round(temperature)} <Celsius>°C</Celsius>
        </Temperature>
        <WeatherIcon currentWeatherCode={weatherCode} moment={moment} />
      </CurrentWeather>
      <AirFlow theme={theme[currentMode]}>
        <AirFlowIcon />
        {windSpeed} m/h
      </AirFlow>
      <Rain theme={theme[currentMode]}><RainIcon />{Math.round(rainPossibility)}%</Rain>
      <Refresh onClick={fetchData} isLoading={isLoading} theme={theme[currentMode]}>
        最後觀測時間：
        {new Intl.DateTimeFormat('zh-TW', {
          hour: 'numeric',
          minute: 'numeric',
        }).format(new Date(observationTime))}{' '}
        {isLoading ? <LoadingIcon /> : <RefreshIcon />}
      </Refresh >
    </WeatherCardWrapper>
  )
}

export default WeatherCard