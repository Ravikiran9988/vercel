
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({ skinType: '', skinIssues: '', image: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [routineChecklist, setRoutineChecklist] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [weatherTip, setWeatherTip] = useState('');
  const [weatherProducts, setWeatherProducts] = useState([]);
  const [manualClimate, setManualClimate] = useState('');

  // ✅ Point to your Railway backend
  const baseURL = 'https://railway-production-0187.up.railway.app';
  const apiKey = '23bfad4463c848daa6ef9b170f98efa0';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${baseURL}/api/dashboard/data`, {
          headers: { Authorization: token },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data = await res.json();
        setRoutineChecklist(data.routineChecklist || []);
        setAnalysisHistory(data.analysisHistory || []);
        setUserInfo(data.user || {});
      } catch (err) {
        console.error('Error loading dashboard data:', err.message);
      }
    };

    if (token) fetchDashboardData();
    fetchWeather();
  }, [token]);

  const fetchWeather = async () => {
    try {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        const { latitude, longitude } = coords;
        const apiKey = '23bfad4463c848daa6ef9b170f98efa0';
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
        );
        const data = await res.json();
        const { temp, humidity } = data.main;
        const condition = data.weather[0].main.toLowerCase();
        generateWeatherTips(condition, temp, humidity);
      });
    } catch (err) {
      console.error('Weather fetch error:', err);
    }
  };

  const generateWeatherTips = (condition, temp = 25, humidity = 50) => {
    let tip = '';
    let products = [];

    if (condition.includes('rain') || condition.includes('humid') || humidity > 75) {
      tip = 'It’s humid! Use lightweight, non-comedogenic products.';
      products = ['Oil-Free Moisturizer by NeutroCare', 'Mattifying Sunscreen by ClearSkin'];
    } else if (condition.includes('clear') || condition.includes('sunny') || temp > 30) {
      tip = 'It’s sunny! Don’t skip broad-spectrum sunscreen and hydration.';
      products = ['SPF 50 Sunscreen by SunSafe', 'Hydrating Mist by AquaDerm'];
    } else if (condition.includes('cold') || temp < 15) {
      tip = 'It’s cold! Use thick moisturizers and lip balms.';
      products = ['Deep Nourish Cream by DermaCozy', 'SPF Lip Balm by GlowFix'];
    } else {
      tip = 'Mild weather today. Maintain a balanced skincare routine.';
      products = ['Gentle Cleanser by PureGlow', 'Daily Moisturizer by DermaBalance'];
    }

    setWeatherTip(tip);
    setWeatherProducts(products);
  };

  const handleManualClimate = (e) => {
    e.preventDefault();
    if (manualClimate.trim()) {
      generateWeatherTips(manualClimate.toLowerCase());
    }
  };

  const handleInputChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (file) => {
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const toggleChecklist = async (index) => {
    const updated = [...routineChecklist];
    updated[index].done = !updated[index].done;
    setRoutineChecklist(updated);
    try {
      await fetch(`${baseURL}/api/dashboard/update-checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ checklist: updated }),
      });
    } catch (err) {
      console.error('Checklist update failed:', err.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recommendations).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const shareByEmail = () => {
    const body = encodeURIComponent(`Here are your skincare recommendations:\n\n${recommendations}`);
    window.location.href = `mailto:?subject=My Skincare Report&body=${body}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { skinType, skinIssues, image } = form;
    if (!skinType || !skinIssues || !image) {
      alert('Please fill in all fields and upload an image.');
      return;
    }

    if (!token) {
      alert('You must be logged in.');
      return;
    }

    const formData = new FormData();
    formData.append('skinType', skinType);
    formData.append('skinIssues', skinIssues);
    formData.append('image', image);

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/submit`, {
        method: 'POST',
        headers: { Authorization: token },
        body: formData,
      });
      const data = await res.json();
      setResponseMsg(data.message || 'Analysis complete.');

      if (res.ok) {
        setRecommendations(data.recommendations);
        const newEntry = {
          skinType,
          skinIssues,
          result: data.recommendations,
        };
        setAnalysisHistory((prev) => [...prev, newEntry]);

        await fetch(`${baseURL}/api/dashboard/add-history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({ entry: newEntry }),
        });
      } else {
        setRecommendations('');
      }
    } catch (err) {
      console.error('Submit error:', err.message);
      setResponseMsg('An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {userInfo?.username || 'User'}!</h1>
      <p>Get customized skincare insights and tools.</p>

      {/* Skin Analysis Form */}
      <form onSubmit={handleSubmit} className="dashboard-form">
        <label>
          Skin Type:
          <select name="skinType" value={form.skinType} onChange={handleInputChange} required>
            <option value="">Select</option>
            <option value="Oily">Oily</option>
            <option value="Dry">Dry</option>
            <option value="Combination">Combination</option>
            <option value="Sensitive">Sensitive</option>
          </select>
        </label>

        <label>
          Skin Issues:
          <input
            type="text"
            name="skinIssues"
            value={form.skinIssues}
            onChange={handleInputChange}
            placeholder="e.g., acne, redness"
            required
          />
        </label>

        <label>
          Upload Image:
          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files[0])} required />
        </label>

        {preview && <div className="image-preview-zoom"><img src={preview} alt="Skin Preview" /></div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze My Skin'}
        </button>
      </form>

      {/* Result & Recommendations */}
      {responseMsg && (
        <div className="result-section">
          <h2>Result</h2>
          <p>{responseMsg}</p>
          <div className="recommendations">
            <h3>Recommendations:</h3>
            <p>{recommendations}</p>
            <button onClick={copyToClipboard}>Copy</button>
            <button onClick={shareByEmail}>Email Result</button>
            {copySuccess && <span>{copySuccess}</span>}
          </div>
        </div>
      )}

      {/* Dashboard Extras */}
      <div className="extra-sections">
        {/* Manual Climate Input */}
        <div className="manual-climate-input">
          <h3>Choose Climate Manually</h3>
          <form onSubmit={handleManualClimate}>
            <select value={manualClimate} onChange={(e) => setManualClimate(e.target.value)} required>
              <option value="">Select climate</option>
              <option value="sunny">Sunny</option>
              <option value="rainy">Rainy</option>
              <option value="humid">Humid</option>
              <option value="cold">Cold</option>
              <option value="mild">Mild</option>
            </select>
            <button type="submit">Apply</button>
          </form>
        </div>

        {/* Weather Products */}
        <div className="products-suggest">
          <h3>Weather-Based Products</h3>
          <ul>{weatherProducts.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>

        {/* Weather Tip */}
        <div className="weather-tip">
          <h3>Weather-Based Tip</h3>
          <p>{weatherTip}</p>
        </div>

        {/* Routine Checklist */}
        <div className="routine-checklist">
          <h3>Your Routine</h3>
          <ul>
            {routineChecklist.map((item, index) => (
              <li key={index}>
                <input type="checkbox" checked={item.done} onChange={() => toggleChecklist(index)} />
                {item.step}
              </li>
            ))}
          </ul>
        </div>

        {/* AI Analysis History */}
        <div className="analysis-history">
          <h3>AI Analysis History</h3>
          <ul>
            {analysisHistory.map((entry, index) => (
              <li key={index}>
                {entry.skinType} | {entry.skinIssues} ➜ {entry.result}
              </li>
            ))}
          </ul>
        </div>

        {/* Profile Access */}
        <div className="profile-actions">
          <h3>Account Settings</h3>
          <button onClick={() => navigate('/Profile')}>Go to Profile & Settings</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
