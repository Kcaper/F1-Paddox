fetch('http://127.0.0.1:8000/api/predictions/season/driver-standings')
.then((response) => response.json())
.then((data) => {
  const f2drivers = JSON.parse(data)
  console.log(f2drivers.drivers[0])
});