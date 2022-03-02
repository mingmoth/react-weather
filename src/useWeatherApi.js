import { useState, useEffect, useCallback} from 'react'

const fetchCurrentWeather = (locationName) => {
  return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${process.env.REACT_APP_OWA}&locationName=${locationName}`)
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

const fetchWeatherForecast = (cityName) => {
  return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${process.env.REACT_APP_OWA}&locationName=${cityName}`)
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

const fetchSunriseNset = (cityName) => {
  const currentDay = new Date().toISOString().slice(0, 10)
  let tomorrow = new Date(new Date())
  tomorrow = new Date(tomorrow.setDate(tomorrow.getDate() + 1)).toISOString().slice(0, 10)
  return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/A-B0062-001?Authorization=${process.env.REACT_APP_OWA}&format=JSON&locationName=${cityName}&timeFrom=${currentDay}&timeTo=${tomorrow}`)
    .then(response => response.json())
    .then(data => {
      const currentDate = data.records.locations.location[0].time[0].dataTime
      const locationData = data.records.locations.location[0].time[0].parameter
      const weatherElements = locationData.reduce((neededElements, item) => {
        if (['日出時刻', '日沒時刻'].includes(item.parameterName)) {
          neededElements[item.parameterName] = item.parameterValue
        }
        return neededElements
      }, {})
      const currentTime = new Date().getTime()
      const sunrise = new Date(`${currentDate} ${weatherElements['日出時刻']}`).getTime()
      const sunset = new Date(`${currentDate} ${weatherElements['日沒時刻']}`).getTime()
      return {
        moment: currentTime < sunrise || currentTime > sunset ? 'night' : 'day'
      }
    })
}

const useWeatherApi = (currentLocation) => {
  const { locationName, cityName } = currentLocation
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
    isLoading: true,
    moment: 'day',
  })

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast, currentMoment] = await Promise.all([
        fetchCurrentWeather(locationName),
        fetchWeatherForecast(cityName),
        fetchSunriseNset(cityName),
      ])
      setWeatherItem({
        ...currentWeather,
        ...weatherForecast,
        ...currentMoment,
        isLoading: false,
      })
    }
    setWeatherItem(preState => ({
      ...preState,
      isLoading: true
    }))
    fetchingData()
  }, [locationName, cityName])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return [weatherItem, fetchData]
}

export default useWeatherApi