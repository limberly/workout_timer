// Functionality to add: each workout should have a button, so if a person wants to start from that workout again, click on that button, and timer starts from that workout.

import { useState, useEffect } from "react";

const ShowSavedWorkouts = (props) => {
  const keys = Object.keys(localStorage);
  const workoutKeys = keys.map(k => <li key={k}>{k} <UseWorkout setWorkouts={props.setWorkouts} workout={k}/></li>);
  return (
    <ol>{workoutKeys}</ol>
    );
};

const UseWorkout = (props) => {
  const useWorkout = () => {
    const workouts = JSON.parse(localStorage.getItem(props.workout));
    props.setWorkouts(workouts);
  }

  const deleteWorkout = () => {
    localStorage.removeItem(props.workout);
  }
  return (
    <div>
      <button onClick={useWorkout}>use</button>
      <button onClick={deleteWorkout}>delete</button>
    </div>
    
  )
}

const ShowWorkouts = ({workouts}) => {
  if (workouts.length === 0) {
    return null;
  }
  return (
    <ol>
      {workouts.map(workout => <li key={workout.id}>{`${workout.workout} for ${workout.duration}sec rest ${workout.rest}sec`}</li>)}
    </ol>
  );
};

const ShowCountdown = ({workouts}) => {
  const [counter, setCounter] = useState(0);
  const [active, setActive] = useState(false);
  const [rest, setRest] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState(0);

  // Set interval when the component renders. so counter goes down 1 sec.
  // It needs to stop after 1 sec, so we delete the setInterval from the system after the effect has run.
  useEffect(() => {
    let timer = null;

    // If time remains and still working, reduce 1 sec from timer.
    if (counter > 0 && active) {
      timer = setInterval(() => {
        setCounter(counter - 1);
      }, 1000);

      // When workout is done, start the rest timer. 
    } else if (counter === 0 && active && !rest) {
      setCounter(currentWorkout.rest);
      setRest(true);

      // When rest time is up, check if we have more workouts left.
      // If there are more workouts, set timer to next workout duration.
      // If there is no more workout, turn the timer off.
      // Turn rest timer off either way.
    } else if (counter === 0 && active && rest) {

      if (workouts[currentWorkout.id + 1]) {
        const nextWorkout = workouts[currentWorkout.id + 1];
        setCounter(nextWorkout.duration);
        setCurrentWorkout(nextWorkout);
      } else {
        setActive(false);
      }
      setRest(false);
    }

    // Clean the setInterval after every render.
    return () => clearInterval(timer)

  }, [active, counter]);
  
  const changeButton = () => {
    if (currentWorkout === 0) {
      return 'begin workout';

      // To show reset button, it needs to come before the other two if statements.
      // Other two only depends on active but this one depends on other variable states.
    } else if (counter === 0 && !active && !rest) {
      return 'reset';
    } else if (active) {
      return 'pause';
    } else if (!active){
      return 'start';
    }
  };

  const beginWorkOut = () => {
    // Controls start, pause, and reset behavior of the button.
    if (!workouts.length) {
      alert('No workouts to begin');
    } else if (currentWorkout === 0 && workouts.length) {
      const workout = workouts.find((workout)=>workout.id === currentWorkout);
      setCurrentWorkout(workout);
      setCounter(workout.duration);
      setActive(true);
    } else if (counter === 0 && !active && !rest) {
      setCurrentWorkout(0);
    } else if (active) {
      setActive(false);
    } else if (!active) {
      setActive(true);
    }
  };

  const resetWorkout = () => {
    setActive(false);
    setCounter(0);
    setRest(false);
    setCurrentWorkout(0);
  }

  return (
    <>
      <h2>{currentWorkout.workout ? currentWorkout.workout : 'Not Started'}</h2>
      <h2>{rest ? 'Rest' : null}</h2>
      <h3>{counter}</h3>
      <button onClick={beginWorkOut}>
        {changeButton()}
      </button>
      <button onClick={resetWorkout}>reset</button>
    </>

  );
};

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState('');
  const [duration, setDuration] = useState(0);
  const [rest, setRest] = useState(0);
  const [counter, setCounter] = useState(0);


  const handleNewWorkoutChange = event => {
    setNewWorkout(event.target.value);
  };

  const handleDurationChange = event => {
    setDuration(event.target.value);
  };

  const handleRestChange = event => {
    setRest(event.target.value);
  };

  const addWorkout = (event) => {
    event.preventDefault();
    const workoutObject = {
      id: counter,
      workout: newWorkout,
      duration,
      rest
    };
    setCounter(counter + 1);
    setWorkouts(workouts.concat(workoutObject));
    setNewWorkout('');
  };

  const saveWorkouts = () => {
    if (!workouts.length) {
      alert('No workouts to save');
      return
    }
    const workoutName = prompt('Name of this workout');
    const workoutExists = Object.keys(localStorage).includes(workoutName);
    if (workoutName && !workoutExists) {
      localStorage.setItem(workoutName, JSON.stringify(workouts));
    } else if (workoutExists) {
      alert('This workout name exists');
    }
    
  };



  return (
    <div>
      <h1>Workout Timer</h1>
      <h3>saved workouts</h3>
      <ShowSavedWorkouts setWorkouts={setWorkouts}/>
      <form onSubmit={addWorkout}>
        <input placeholder="new workout" value={newWorkout} onChange={handleNewWorkoutChange}/>
        <input type='number' name='duration' placeholder="duration" onChange={handleDurationChange}/>
        <input type='number' placeholder="rest" onChange={handleRestChange}/>
        <input type='submit' value='add'/>
      </form>
      {/* Show all workouts */}
      <ShowWorkouts workouts={workouts}/>
      <button onClick={saveWorkouts}>save</button>
      {/* show the countdown */}
      <ShowCountdown workouts={workouts}/>
      
    </div>
  );
}

export default App;
