import { useEffect, useState } from "react";

export default function TestApi() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5200/weatherforecast")
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("API error:", err));
  }, []);

  return (
    <div>
      <h3>API Response:</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}