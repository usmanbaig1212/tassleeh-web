import NewsLetter from "../components/NewsLetter";
import Button from "../components/Button";
import Card from "../components/common/Card";
import CardTwo from "../components/common/Card Two";
import Head from "next/head";
import Link from "next/link";
import { ImSpinner9 } from "react-icons/im";
import { HiSearch } from "react-icons/hi";
import CardThree from "../components/common/Card Three";
import TextInput from "../components/TextInput";
import ReviewCard from "../components/common/ReviewCard";

import {
	useJsApiLoader,
	GoogleMap,
	Marker,
	InfoWindow,
	// Autocomplete,
	// DirectionsRenderer,
} from "@react-google-maps/api";
import PlacesAutocomplete, {
	geocodeByAddress,
	geocodeByPlaceId,
	getLatLng,
} from "react-places-autocomplete";
import HomeSlider from "../components/homeSlider/HomeSlider";
import { useState, useEffect } from "react";
import {
	getAllJobs,
	getJobsByLatLng,
	getWebStat,
} from "../services/auth-service";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useRef } from "react";
import HomeServiceCard from "../components/common/HomeServiceCard";

const Home = () => {
	const [spinner, setSpinner] = useState(false);
	const [toggleMarkerSize, setToggleMarkerSize] = useState("");
	const [toggleInfoWindow, setToggleInfoWindow] = useState("");
	const [searchValue, setSearchValue] = useState("");
	const [address, setAddress] = useState("");
	// console.log(address,"search address")
	const [searchLatLong, setSearchLatLong] = useState("");
	const router = useRouter();
	const [mapCenter, setMapCenter] = useState({
		lat: "",
		long: "",
	});
	const [webStatics, setWebStatics] = useState(null);
	// const [cardData, SetCardData] = useState();
	const [cardData, setCardData] = useState([]);
	const [filterData, setFilterData] = useState([]);
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: "AIzaSyDZpy-p-5laOeZQcRD_FZSTc0MITID2zKo",
		id: "google-map-script",
	});
	const [geoLocation, setGeoLocation] = useState({
		lat: 0,
		long: 0,
	});
	const handleSelect = async (value, placeId, suggestion) => {
		const results = await geocodeByAddress(value);
		const ll = await getLatLng(results[0]);
		console.log(ll, "check");
		setMapCenter(ll);
		setSearchLatLong(ll);
		setAddress(value);
		const [place] = await geocodeByPlaceId(placeId);
		// console.log(place, "HASHAM");	8
		// const { long_name: localCity = "" } =
		//   place.address_components.find((c) => c.types.includes("locality")) || {};
		// const { long_name: postalCode = "" } =
		// 	place.address_components.find((c) => c.types.includes("postal_code")) ||
		// 	{};
		// const { long_name: localState = "" } =
		//   place.address_components.find((c) =>
		//     c.types.includes("administrative_area_level_1")
		//   ) || {};
		// const { long_name: country = "" } =
		//   place.address_components.find((c) => c.types.includes("country")) || {};

		// setData((prev) => ({
		//   ...prev,
		//   country: country,
		//   city: localCity,
		//   // zip: postalCode,
		//   state: localState,
		//   address: address,
		// }));
	};
	const searchByCordinates = (body) => {
		console.log(body, "body");
		setSpinner(false);
		getJobsByLatLng(body)
			.then((res) => {
				setCardData(res?.data);
				setFilterData(res?.data);
				setSpinner(false);
			})
			.catch((err) => {
				setSpinner(false);
				toast.error(err?.message);
			});
	};
	const getWebsiteStas = () => {
		setSpinner(false);
		getWebStat()
			.then((res) => {
				console.log(res, "webstats");
				setWebStatics(res?.data);
				setSpinner(false);
			})
			.catch((err) => {
				console.log(err);
				toast.error(err?.message);
				setSpinner(false);
			});
	};

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(showPosition);
		getWebsiteStas();
	}, []);
	function showPosition(position) {
		console.log(position, "position");
		let body = {
			lat: position?.coords?.latitude,
			long: position?.coords?.longitude,
		};
		setMapCenter({
			...mapCenter,
			lat: position?.coords?.latitude,
			long: position?.coords?.longitude,
		});
		searchByCordinates(body);
	}
	const handleSearch = () => {
		// e.preventDefault();
		if (searchValue === "") {
			let body = {
				lat: searchLatLong.lat,
				long: searchLatLong.lng,
			};
			setSpinner(false);
			getJobsByLatLng(body)
				.then((res) => {
					setFilterData(res?.data);
					setSpinner(false);
				})
				.catch((err) => {
					console.log(err, "err");
					toast.error(err?.message);
					setSpinner(false);
				});
		} else if (searchValue && searchLatLong) {
			let body = {
				lat: searchLatLong.lat,
				long: searchLatLong.lng,
			};
			setSpinner(false);
			getJobsByLatLng(body)
				.then((res) => {
					let resp = res?.data;
					setSpinner(false);
					let filterResp = resp.filter((item) =>
						item?.jobTitle?.toLowerCase().includes(searchValue?.toLowerCase())
					);
					console.log(filterResp, "filter");
					setFilterData(filterResp);
				})
				.catch((err) => {
					console.log(err, "err");
					setSpinner(false);
					toast.error(err?.message);
				});
		} else {
			let res = cardData?.filter((item, index) =>
				item?.jobTitle?.toLowerCase().includes(searchValue?.toLowerCase())
			);
			setFilterData(res);
		}
	};
	//
	const center = {
		lat: mapCenter?.lat,
		lng: mapCenter?.long || mapCenter?.lng,
	};
	console.log("mapCenter: ", mapCenter);
	console.log(center, "mapCenter");
	const divStyle = {
		width: "330px",
		height: "320px",
	};
	const handleMarkerSize = (id) => {
		setToggleMarkerSize(id);
	};
	const openInfoWindow = (id) => {
		setToggleInfoWindow(id);
	};

	const mapRef = useRef();
	const HomeServicesData = [
		{
			title: "Cars",
			description: "Get best mechanic services for your cars right away.",
			icon: "/images/Group.png",
			services: [
				"Electricity",
				"Mechanics",
				"Dyeing/Black Smith",
				"Oil",
				"Recorders",
				"Tire",
			],
		},
		{
			title: "Electronics",
			description:
				"Stress no further because TASSLEEH in-house expert electrician here to serve.",
			icon: "/images/Group (1).png",
			services: [
				"Laptop",
				"Computer",
				"Smart Watches",
				"Tablet",
				"Satellite",
				"CCTV Cameras",
			],
		},
		{
			title: "Home",
			description: "Get best mechanic services for your cars right away.",
			icon: "/images/Group (2).png",
			services: [
				"Electricity/Home Appliance",
				"Plumbing",
				"Door/Window",
				"Carpenter/Paint",
				"AC",
				"Furniture/Ceramic/Marble",
			],
		},
		{
			title: "Accessories",
			description: "Get best mechanic services for your cars right away.",
			icon: "/images/Group3.png",
			services: ["Bags", "Shoes", "Jewelry", "Watches", "Clothes", "Suit Case"],
		},
	];
	const ReviewCardData = [
		{
			icon: "/images/Ellipse 17.png",
			title: "Tom Davis",
			description:
				'I received support from TASSLEEH in ways that are beyond words. One of the key drivers of our hyper growth was their very competent workforce. These people truly embody the phrase "worth for money."',
		},
	];
	return (
		<div>
			{spinner && (
				<div className="fixed z-50 w-full">
					<div className="h-[100vh] w-[200%] z-50 right-0 bottom-0 backdrop-blur-sm fixed"></div>
					<div className="z-50 h-[530px] sm:w-[600px] rounded-xl m-auto  top-[55px] relative">
						<div className="flex justify-center h-full items-center">
							<ImSpinner9 className="z-50 text-[50px] animate-spin" />
						</div>
					</div>
				</div>
			)}
			<Head>
				<title> Home - Tassleeh </title>
			</Head>
			<div className="back">
				<section className="">
					<div className="flex flex-col justify-center items-center gap-y-5 ">
						<div className="mt-24">
							<h1 className="text-6xl text-[#0A093D] font-bold">
								We Provide <span className="text-[#03A0CB]">Best</span> Services
							</h1>
							<p className="text-[#656464] text-lg text-center pt-4">
								TASSLEEH provides best services for your cars, electronics,
								home, and accessories.
							</p>
						</div>
						<div className="flex border px-4 py-1.5 rounded-lg items-center">
							<div className="flex gap-4">
								<img src="/images/search.png" alt="" />
								<input
									type="text"
									className="w-[350px]"
									placeholder="search here"
								/>
							</div>
							<div>
								<Button
									text="Search"
									customClass="bg-primary rounded-full p-2 text-xs font-semibold text-white !w-28 !h-12"
								/>
							</div>
						</div>
					</div>
				</section>
				{/* ---------------------Services------------------------- */}
				<section className="flex flex-wrap justify-center gap-12 mt-20  px-48 ">
					{HomeServicesData.map((item, index) => {
						return (
							<div className="mb-16">
								<HomeServiceCard key={index} item={item} />
							</div>
						);
					})}
				</section>
			</div>
			{/* -------------------Availaible-jobs----------------------- */}
			<section className="flex justify-center mt-24">
				<div className=" pt-2 px-5 w-2/5">
					<p className=" text-primary font-medium text-base my-4">
						Whats TASSLEEH?
					</p>
					<h1 className="text-2xl font-bold text-[#0a093d] my-4">
						Why Choose TASSLEEH Platform?
					</h1>
					<p className="mt-2 mb-2 text-base font-normal leading-8 text-[#656464] w-[460px]">
						We are a value addition which covers all 360 services under one
						platform. Our motive is to provide best services to our corporate,
						commercial, and residential customers.
					</p>
					<div className="my-4">
						<div className="flex items-center mb-4">
							<div className="">
								<img className="mx-auto py-1" src="/images/dot-1.png" alt="" />
							</div>
							<p className="px-3 text-lg font-normal leading-8 opacity-70">
								Vetted and background-checked in house staff
							</p>
						</div>
						<div className="flex items-center mb-4">
							<div className="">
								<img className="mx-auto py-1" src="/images/dot-1.png" alt="" />
							</div>
							<p className="px-3 text-lg font-normal leading-8 opacity-70">
								High-Tech and Most Advanced Equipment
							</p>
						</div>
						<div className="flex items-center mb-4">
							<div className="">
								<img className="mx-auto py-1" src="/images/dot-1.png" alt="" />
							</div>
							<p className="px-3 text-lg font-normal leading-8 opacity-70">
								Quality Control and Safety
							</p>
						</div>
						<div className="flex items-center mb-4">
							<div className="">
								<img className="mx-auto py-1" src="/images/dot-1.png" alt="" />
							</div>
							<p className="px-3 text-lg font-normal leading-8 opacity-70">
								Affordable and Upfront Pricing
							</p>
						</div>
						<div className="flex items-center mb-4">
							<div className="">
								<img className="mx-auto py-1" src="/images/dot-1.png" alt="" />
							</div>
							<p className="px-3 text-lg font-normal leading-8 opacity-70">
								Timely and Convenient Services
							</p>
						</div>
						<div className="flex items-center mb-2">
							<div className="">
								<img className="mx-auto py-1" src="/images/dot-1.png" alt="" />
							</div>
							<p className="px-3 text-lg font-normal leading-8 w opacity-70">
								Experienced, Trained and Certified
							</p>
						</div>
					</div>
					<div>
						<Button
							text="Get Started"
							customClass="bg-primary rounded-2xl p-2 text-sm font-semibold text-white !w-32 !h-14"
						/>
					</div>
				</div>
				<div>
					<div>
						<img src="/images/group-0.png" alt="" />
					</div>
				</div>
			</section>
			{/* ---------------------------Our Achievement------------------------ */}
			<section>
				<div>
					<div className="mt-32">
						<img className="w-full" src="/images/Our Achievement.png" alt="" />
					</div>
				</div>
			</section>

			{/* ----------------------------Popular------------------------------- */}
			<section className="flex justify-center  mt-24">
				<div className=" pt-2 px-5 w-2/5 mt-12">
					<p className=" text-primary font-medium text-lg my-4">About Us</p>
					<h1 className="text-4xl font-bold text-[#0a093d] my-5 w-80">
						About TASSLEEH Platform?
					</h1>
					<p className="mt-2 mb-2 text-base font-normal leading-8 text-[#656464] w-[460px]">
						TASSLEEH is a leading multiple service provider platform catering to
						your 360 needs with quality guaranteed. Our aim and priority is to
						add value to our consumers' lives by providing smart solutions to
						all their problems.
					</p>

					<div className="flex gap-4 mt-10">
						<Button
							text="Get Started"
							customClass="bg-primary rounded-2xl p-2 text-sm font-semibold text-white !w-32 !h-14"
						/>
						<Button
							text="Invite Friend"
							customClass="text-primary rounded-2xl p-2 text-sm font-semibold border border-primary !w-32 !h-14"
						/>
					</div>
				</div>
				<div>
					<img src="/images/about.png" alt="" />
				</div>
			</section>
			{/* -----------------------------Customer reviews------------------- */}
			<section>
				<div className="flex flex-col justify-center items-center mt-20">
					<p className="text-primary text-lg mb-2">Customer Reviews</p>
					<h1 className="text-4xl font-bold text-[#0a093d]">
						Valuable Customers Sharing Their Reviews{" "}
					</h1>
				</div>
				<div>
					{ReviewCardData.map((item, index) => {
						return (
							<div className="mb-16 px-16 relative">
								<div className="absolute top-[-17px] left-9">
									<img className="h-12" src="/images/semicolon.png" alt="" />
								</div>
								<div>
									<ReviewCard key={index} item={item} />
								</div>
							</div>
						);
					})}
				</div>
			</section>
			{/* --------------------------Popular-companies----------------------------- */}

			{/* ---------------------------Dowload-APP--------------------------- */}
			<section className="flex justify-around items-center bg-[#f4f9ff] mt-20">
				<div className="">
					<div className="pl-6">
						<p className="text-lg text-primary font-semibold ">
							Download Our Mobile Application
						</p>
						<h2 className="text-[#0a093d] text-4xl font-bold w-96 my-3">
							You Can Easily Find Our Mobile App…!
						</h2>
						<p className="w-96 text-[#656464]">
							Make your life easier by downloading TASSLEEH Mobile Application.
							We provide best services. Start your with us now...
						</p>
					</div>
					<div className="flex items-center">
						<img src="/images/app.png" alt="android store" />
						<img src="/images/android.png" alt="app store" />
					</div>
				</div>
				<div>
					<div>
						<img className="h-[500px]" src="/images/mobile muckup.png" alt="" />
					</div>
				</div>
			</section>
			{/* -------------------------------------Newsletter--------------------------- */}
			<div>
				<NewsLetter />
			</div>
		</div>
	);
};

export default Home;
