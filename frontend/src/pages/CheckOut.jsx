import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, TileLayer, Marker} from "react-leaflet";
import { useMap } from "react-leaflet"; 
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { setAddress, setLocation } from "../redux/mapSlice";
import { useState } from "react";
import { useEffect } from "react";
import { use } from "react";



function RecenterMap({location}){
  const map=useMap()
  if(location?.lat && location?.lon){
    map.setView([location.lat, location.lon], 16, {animate:true});
  }
  return null;
}

function CheckOut() {
  const {location, address} = useSelector((state) => state.map);
  const [addressInput, setAddressInput] = useState("");
  const dispatch = useDispatch();
  const apiKey=import.meta.env.VITE_GEO_API_KEY;
  const onDragEnd = (e) => {
    const {lat, lng} = e.target._latlng;
    dispatch(setLocation({lat, lon: lng}))
    getAddressByLatLng(lat, lng);
  }

  const getAddressByLatLng = async (lat, lon) => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apiKey}`);
      dispatch(setAddress(result?.data?.results[0].formatted || result?.data?.results[0].address_line1 || result?.data?.results[0].address_line2));
      
    } catch (error) {
      console.error("Error fetching address:", error);
      
    }
  }
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            dispatch(setLocation({ lat: latitude, lon: longitude }));
            getAddressByLatLng(latitude, longitude);
    });
  }
  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`);
      const {lat, lon} = result.data.features[0].properties;
      dispatch(setLocation({lat, lon}));
    }
    catch (error) {
      console.error("Error fetching lat/lng:", error);
    }
  }

  useEffect(() => {
    setAddressInput(address);
  }, [address])

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#fff9f6] flex item-center justify-center p-6">
      <div className="absolute top-[20px] left-[20px] z-[10] cursor-pointer" onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>
      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        {/* Map Location Section */}
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800"><IoLocationSharp className="text-[#ff4d2d]" />Delivery Location</h2>
          <div className="flex gap-2 mb-3">
            <input type="text" className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]" placeholder="Enter Your Delivery Address..." value={addressInput} onChange={(e) => setAddressInput(e.target.value)}/>
            <button className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer" onClick={getLatLngByAddress}><IoSearchOutline size={17} /></button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer" onClick={getCurrentLocation}><TbCurrentLocation size={17} /></button>
          </div>
          {/* Map showing current location */}
          <div className="rounded-xl border overflow-hidden ">
            <div className="h-64 w-full flex item-center justify-center">
              <MapContainer className={"w-full h-full"} center={[location?.lat, location?.lon]} zoom={17} scrollWheelZoom={false}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <RecenterMap location={location}/>
                <Marker position={[location?.lat, location?.lon]} draggable eventHandlers={{dragend:onDragEnd}}/>
              </MapContainer>

            </div>
          </div>

        </section>
        {/* Payment Section */}
        <section>
          <h2 className="">Payment Method</h2>
        </section>

      </div>
    </div>
  );
}

export default CheckOut;
