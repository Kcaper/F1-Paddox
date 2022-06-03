import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Button from "@material-ui/core/Button";
import axios from 'axios'
import './static/css/drivers.css'


const userId = {
  "username" : "John"
}

const raceId = {
  "circuit" : "Australia",
  "date" : "03/03/2020",
  "startTime" : "2:15 GMT",
  "round" : 1
};

const f2drivers = [
  {
    previousPrediction: "7",
    name: 'Lewis Hamilton',
    thumb: './static/images/Drivers/LewisHamilton.png',
    icon: './static/images/MercedesIcon.png',
    flag: './static/images/flags/united-kingdom.png',
    id: "1"
  },
  {
    previousPrediction: "7",
    name: 'Valterri Bottas',
    thumb: './static/images/Drivers/ValterriBottas.png',
    icon: './static/images/MercedesIcon.png',
    flag: './static/images/flags/finland.png',
    id: '2'
  },
  {
    previousPrediction: "7",
    name: 'Max Verstappen',
    thumb: './static/images/Drivers/MaxVerstappen.png',
    icon: './static/images/RedBullIcon.png',
    flag: './static/images/flags/netherlands.png',
    id: '3'
  },
  {
    previousPrediction: "7",
    name: 'Sergio Perez',
    thumb: './static/images/Drivers/SergioPerez.png',
    icon: './static/images/RedBullIcon.png',
    flag: './static/images/flags/mexico.png',
    id: '4'
  },
  {
    previousPrediction: "7",
    name: 'Lando Norris',
    thumb: './static/images/Drivers/LandoNorris.png',
    icon: './static/images/MclarenIcon.png',
    flag: './static/images/flags/united-kingdom.png',
    id: '5'
  },
  {
    previousPrediction: "7",
    name: 'Daniel Ricciardo',
    thumb: './static/images/Drivers/DanielRicciardo.png',
    icon: './static/images/MclarenIcon.png',
    flag: './static/images/flags/australia.png',
    id: '6'
  },
  {
    previousPrediction: "7",
    name: 'Sebastian Vettel',
    thumb: './static/images/Drivers/SebastianVettel.png',
    icon: './static/images/AstonMartinIcon.png',
    flag: './static/images/flags/Germany.png',
    id: '7'
  },
  {
    previousPrediction: "7",
    name: 'Lance Stroll',
    thumb: './static/images/Drivers/LanceStroll.png',
    icon: './static/images/AstonMartinIcon.png',
    flag: './static/images/flags/canada.png',
    id: '8'
  },
  {
    previousPrediction: "7",
    name: 'Yuki Tsunoda',
    thumb: './static/images/Drivers/YukiTsunoda.png',
    icon: './static/images/AlphaTauriIcon.png',
    flag: './static/images/flags/japan.png',
    id: '9'
  },
  {
    previousPrediction: "7",
    name: 'Pierre Gasly',
    thumb: './static/images/Drivers/PierreGasly.png',
    icon: './static/images/AlphaTauriIcon.png',
    flag: './static/images/flags/france.png',
    id: '10'
  },
  {
    previousPrediction: "7",
    name: 'Fernando Alonso',
    thumb: './static/images/Drivers/FernandoAlonso.png',
    icon: './static/images/AlpineIcon.png',
    flag: './static/images/flags/spain.png',
    id: '11'
  },
  {
    previousPrediction: "7",
    name: 'Estaban Ocon',
    thumb: './static/images/Drivers/EstabanOcon.png',
    icon: './static/images/AlpineIcon.png',
    flag: './static/images/flags/france.png',
    id: '12'
  },
  {
    previousPrediction: "7",
    name: 'Kimi Raikkonen',
    thumb: './static/images/Drivers/KimiRaikkonen.png',
    icon: './static/images/AlphaRomeoIcon.png',
    flag: './static/images/flags/finland.png',
    id: '13'
  },
  {
    previousPrediction: "7",
    name: 'Antonio Giovinazzi',
    thumb: './static/images/Drivers/AntonioGiovinazzi.png',
    icon: './static/images/AlphaRomeoIcon.png',
    flag: './static/images/flags/italy.png',
    id: '14'
  },
  {
    previousPrediction: "7",
    name: 'Nikita Mazepin',
    thumb: './static/images/Drivers/NikitaMazepin.png',
    icon: './static/images/HaasIcon.png',
    flag: './static/images/flags/russia.png',
    id: '15'
  },
  {
    previousPrediction: "7",
    name: 'Mick Schumacher',
    thumb: './static/images/Drivers/MickSchumacher.png',
    icon: './static/images/HaasIcon.png',
    flag: './static/images/flags/germany.png',
    id: '16'
  },
  {
    previousPrediction: "7",
    name: 'George Russel',
    thumb: './static/images/Drivers/GeorgeRussel.png',
    icon: './static/images/WilliamsIcon.png',
    flag: './static/images/flags/united-kingdom.png',
    id: '17'
  },
  {
    previousPrediction: "7",
    name: 'Nicholas Latifi',
    thumb: './static/images/Drivers/NicholasLatifi.png',
    icon: './static/images/WilliamsIcon.png',
    flag: './static/images/flags/canada.png',
    id: '18'
  },
  {
    previousPrediction: "7",
    name: 'Charles Le Clerc',
    thumb: './static/images/Drivers/CharlesLeClerc.png',
    icon: './static/images/FerarriIcon.png',
    flag: './static/images/flags/monaco.png',
    id: '19'
  },
  {
    previousPrediction: "7",
    name: 'Carlos Sainz',
    thumb: './static/images/Drivers/CarlosSainz.png',
    icon: './static/images/FerarriIcon.png',
    flag: './static/images/flags/spain.png',
    id: '20'
  }
]

function DriverPredictions() {

  const [f1drivers, setDrivers] = useState([]);
  const [drivers, updatedrivers] = useState(f1drivers);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/predictions/season/driver-standings')
      .then(res => JSON.parse(res.data))
      .then(res => {
        setDrivers(res.drivers)
        const items = Array.from(res.drivers)
        updatedrivers(items)
        console.log("items " + items)
      })
      .catch(err => {
        console.log(err)
      })
  }, [])

  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(drivers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updatedrivers(items);
  }

  function submitPrediction() {
    fetch('http://127.0.0.1:8000/api/predictions/season/driver-standings/submit/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        
          "isSeasonPrediction": true,
          "user": 16,
          "position1": 1,
          "position2": 2,
          "position3": 5,
          "position4": 6,
          "position5": 7,
          "position6": 8,
          "position7": 9,
          "position8": 10,
          "position9": 11,
          "position10": 12,
          "position11": 13,
          "position12": 14,
          "position13": 15,
          "position14": 16,
          "position15": 17,
          "position16": 18,
          "position17": 20,
          "position18": 21,
          "position19": 22,
          "position20": 23,
          "position21": 1,
          "position22": 2,
      })
    })
  };

  return (
    <div className="DriverPredictions">
      <header className="App-header">
        <h1> { raceId["circuit"]}  midfield battle predictions</h1>
        <h2> { raceId["startTime"]} {raceId["date"]}</h2>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="drivers">
            {(provided) => (
              <ul className="drivers" {...provided.droppableProps} ref={provided.innerRef}>
                {drivers.map(({id, name}, index) => {
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided) => (
                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <div className="position">
                               { index + 1 }
                          </div>
                          <p>
                            { name }
                          </p>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        <div>
          <Button onClick={submitPrediction}>
            SUBMIT
          </Button>
        </div>
      </header>
    </div>
  );
}
export default DriverPredictions;
