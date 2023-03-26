import ProfileSidebar from "../../../components/dashboard/profileSidebar";
import Button from "../../../components/Button";
import { useState, useEffect } from "react";
import Header from "../../../layout/DashboardHeader";
import storage from "../../../config/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { editProfile } from "../../../services/auth-service";
import { ImSpinner9 } from "react-icons/im";
import PlacesAutocomplete, {
	geocodeByAddress,
	geocodeByPlaceId,
	getLatLng,
} from "react-places-autocomplete";
import TextInput from "../../../components/TextInput";
import Head from "next/head";
const Profile = () => {
	const [checkImage, setCheckImage] = useState("");
	const [spinner, setSpinner] = useState(true);
	const [accountTitle, setAccountTitle] = useState("");
	const [isError, setIsError] = useState("");
	const [accountImage, setAccountImage] = useState("");
	const [requesting, setRequesting] = useState(false);
	const [percent, setPercent] = useState(0);
	const [image, setImage] = useState("");
	const [data, setData] = useState();
	const [address, setAddress] = useState("");
	const fetchLocalSt = () => {
		const userData = localStorage?.getItem("user");
		const Data = JSON.parse(userData);
		let fullName = Data?.firstName + " " + Data?.lastName;
		setAddress(Data?.address);
		setAccountTitle(fullName);
		setAccountImage(Data?.image);
		setImage(Data?.image);
		setData(Data);
		setSpinner(false);
	};
	useEffect(() => {
		fetchLocalSt();
	}, []);
	// console.log(data);
	const validate = () => {
		if (data?.firstName === "") {
			toast.error("Please enter your first name");
			setSpinner(false);
			return false;
		} else if (data?.lastName === "") {
			toast.error("Please enter your last name");
			setSpinner(false);
			return false;
		} else if (data?.DOB === "") {
			toast.error("Please enter your date of birth");
			setSpinner(false);
			return false;
		} else if (data?.email === "") {
			toast.error("Please enter email");
			setSpinner(false);
			return false;
		} else if (data?.employStatus === "") {
			toast.error("Please enter your employment status");
			setSpinner(false);
			return false;
		} else if (data?.phone === "") {
			toast.error("Please enter your phone");
			setSpinner(false);
			return false;
		}
		return true;
	};
	const handleSelect = async (value, placeId, suggestion) => {
		const results = await geocodeByAddress(value);
		const ll = await getLatLng(results[0]);
		setData({ ...data, lat: ll.lat, long: ll.lng });
		setAddress(value);
		const [place] = await geocodeByPlaceId(placeId);
		const { long_name: localCity = "" } =
			place.address_components.find((c) => c.types.includes("locality")) || {};

		const { long_name: localState = "" } =
			place.address_components.find((c) =>
				c.types.includes("administrative_area_level_1")
			) || {};
		const { long_name: country = "" } =
			place.address_components.find((c) => c.types.includes("country")) || {};
		setData((data) => ({
			...data,
			country: country,
			city: localCity,
			state: localState,
			// address: address,
		}));
	};

	const editProfileFun = (url) => {
		let body = data;
		body.image = url ? url : image;
		body.address = address;
		let id = body?._id;

		editProfile(body, id)
			.then((res) => {
				if (res?.data?.success) {
					toast.success(res?.data?.message);
					let newData = JSON.stringify(data);
					localStorage.setItem("user", newData);
					fetchLocalSt();
					setSpinner(false);
				} else {
					setSpinner(false);
					toast.warn(res?.data?.message);
				}
			})
			.catch((err) => {
				toast.error("Something went wrong");
				setSpinner(false);
			});
	};
	// File upload on firebase functionality and progress
	const handleFile = (e) => {
		setSpinner(true);
		if (image) {
			if (validate()) {
				if (checkImage) {
					const file = checkImage;
					if (file) {
						const preview = URL.createObjectURL(file);
						// setFile({ obj: file, preview });
						// e.target.value = "";
						const storageRef = ref(
							storage,
							`/client/cvProfileImage/${file.name}`
						);
						//firebase upload and progress
						const uploadTask = uploadBytesResumable(storageRef, file);
						setRequesting(true);
						uploadTask.on(
							"state_changed",
							(snapshot) => {
								const percent = Math.round(
									(snapshot.bytesTransferred / snapshot.totalBytes) * 100
								); // update progress

								setPercent(percent);
							},
							(err) => console.log(err),
							() => {
								// download url
								getDownloadURL(uploadTask.snapshot.ref)
									.then((url) => {
										editProfileFun(url);
									})
									.catch((err) => setCheckImage(""))
									.finally((res) => setRequesting(false));
							}
						);
					}
				} else {
					editProfileFun(data?.image);
				}
			}
		} else if (data?.image) {
			editProfileFun(data?.image);
		} else {
			toast.warn("Please upload profile image");
			setSpinner(false);
		}
	};
	return (
		<>
			{spinner && (
				<div className="fixed z-50 w-full">
					<div className="h-[100%] w-[200%] z-50 right-0 bottom-0 backdrop-blur-sm fixed"></div>
					<div className="z-50  rounded-xl my-auto h-screen sm:right-60 bottom-28 items-center   relative">
						<div className="flex justify-center h-full items-center">
							<ImSpinner9 className="z-50 text-[50px] animate-spin" />
						</div>
					</div>
				</div>
			)}
			<Header
				accountImage={accountImage}
				accountTitle={accountTitle}
				headerTitle={"Profile"}
				headerDiscription={"Get details about your profile."}
				profileLink={"/employee/dashboard/profile"}
			/>
			<div className="flex lg:flex-nowrap flex-wrap justify-center ">
				<div>
					<ProfileSidebar
						image={image}
						getCheckImage={(e) => setCheckImage(e)}
						getImage={(e) => setImage(e)}
						data={data}
					></ProfileSidebar>
				</div>
				<div className="basis-full mx-5">
					<h5 className="py-5 font-semibold text-xl text-[#110229]">
						Profile{" "}
					</h5>
					<div className="flex lg:flex-nowrap flex-wrap items-end gap-5 pb-7  pt-3">
						<input
							type=""
							id=""
							value={data?.firstName}
							onChange={(e) => setData({ ...data, firstName: e.target.value })}
							className="bg-gray-50 border border-gray-100 text-gray-900 text-sm h-12   placeholder:text-gray-500 placeholder:font-base  placeholder:text-sm !w-full p-2.5 outline-none"
							placeholder="Frist Name"
							required
						/>
						<input
							type=""
							id=""
							className="bg-gray-50 border border-gray-100 text-gray-900 text-sm h-12   placeholder:text-gray-500 placeholder:font-base  placeholder:text-sm w-full p-2.5 outline-none"
							placeholder="Last Name"
							onChange={(e) => setData({ ...data, lastName: e.target.value })}
							value={data?.lastName}
							required
						/>
					</div>
					<div className="flex lg:flex-nowrap flex-wrap items-end gap-5 pb-7  pt-3">
						<input
							type=""
							id=""
							readOnly
							value={data?.email}
							className="bg-gray-50 border border-gray-100 text-gray-900 text-sm h-12   placeholder:text-gray-500 placeholder:font-base  placeholder:text-sm !w-full p-2.5 outline-none cursor-not-allowed"
							placeholder="Your Email"
							required
						/>
						<input
							type=""
							id=""
							className="bg-gray-50 border border-gray-100 text-gray-900 text-sm h-12   placeholder:text-gray-500 placeholder:font-base  placeholder:text-sm w-full p-2.5 outline-none"
							placeholder="Date of Birth"
							value={data?.DOB}
							onChange={(e) => setData({ ...data, DOB: e.target.value })}
							required
						/>
					</div>
					<div className="flex lg:flex-nowrap flex-wrap items-end gap-5 pb-7  pt-3">
						<input
							type=""
							id=""
							className="bg-gray-50 border border-gray-100 text-gray-900 text-sm h-12   placeholder:text-gray-500 placeholder:font-base  placeholder:text-sm !w-full p-2.5 outline-none"
							placeholder="Your Post Code"
							value={data?.postCode}
							onChange={(e) => setData({ ...data, postCode: e.target.value })}
							required
						/>
						<input
							type=""
							id=""
							className="bg-gray-50 border border-gray-100 text-gray-900 text-sm h-12   placeholder:text-gray-500 placeholder:font-base  placeholder:text-sm w-full p-2.5 outline-none"
							placeholder="Your Employment Status"
							value={data?.employStatus}
							onChange={(e) =>
								setData({ ...data, employStatus: e.target.value })
							}
							required
						/>
					</div>
					<div className="flex lg:flex-nowrap flex-wrap items-end gap-5 pb-7  pt-3">
						{/* <input
              type=""
              id=""
              className="bg-gray-50 border border-gray-100 text-gray-900 text-sm h-12   placeholder:text-gray-500 placeholder:font-base  placeholder:text-sm !w-full p-2.5 outline-none"
              placeholder="Job Role"
              required
            /> */}
						<input
							type=""
							id=""
							className="bg-gray-50 border border-gray-100 text-gray-900 text-sm h-12   placeholder:text-gray-500 placeholder:font-base  placeholder:text-sm w-full p-2.5 outline-none"
							placeholder="Mobile Number"
							value={data?.phone}
							onChange={(e) => setData({ ...data, phone: e.target.value })}
							required
						/>
						<input
							type=""
							id=""
							className="bg-gray-50 border border-gray-100 text-gray-900 text-sm h-12   placeholder:text-gray-500 placeholder:font-base  placeholder:text-sm w-full p-2.5 outline-none"
							placeholder="Telephone Number"
							value={data?.mobile}
							onChange={(e) => setData({ ...data, mobile: e.target.value })}
							required
						/>
					</div>
					<div className="flex lg:flex-nowrap flex-wrap items-end gap-5 pb-2 ">
						{/* <select
              id="countries"
              class="bg-gray-50 border my-0 border-gray-100 text-gray-900 text-sm h-12   placeholder:text-gray-500 placeholder:font-base  placeholder:text-sm w-full p-2.5 outline-none"
            >
              <option selected>Your Country</option>
              <option>Lahore</option>
              <option>Faislabad</option>
              <option>Multan</option>
            </select> */}
					</div>
					<div>
						<PlacesAutocomplete
							value={address}
							// value={localAddress?localAddress:address}
							onChange={setAddress}
							onSelect={handleSelect}
						>
							{({
								getInputProps,
								suggestions,
								getSuggestionItemProps,
								loading,
							}) => {
								// console.log(data, "address");
								return (
									<div className="relative">
										<input
											value={data?.address}
											{...getInputProps({
												id: "address",
												placeholder: "Address",
												className:
													"bg-gray-50 border border-gray-100 text-gray-900 text-sm h-12   placeholder:text-gray-500 placeholder:font-base  placeholder:text-sm w-full p-2.5 outline-none",
											})}
										/>
										<div className="autocomplete-dropdown-container absolute">
											{loading && <div>Loading...</div>}
											{suggestions.map((suggestion) => {
												const className = suggestion.active
													? "suggestion-item--active"
													: "suggestion-item";
												// inline style for demonstration purpose
												const style = suggestion.active
													? {
															backgroundColor: "#fafafa",
															cursor: "pointer",
															padding: "10px 0px",
													  }
													: {
															backgroundColor: "#ffffff",
															cursor: "pointer",
															padding: "10px 0px",
													  };
												return (
													<div
														{...getSuggestionItemProps(suggestion, {
															className,
															style,
														})}
													>
														<span>{suggestion.description}</span>
													</div>
												);
											})}
										</div>
									</div>
								);
							}}
						</PlacesAutocomplete>
					</div>
					{/* <div className="text-center">
						<h1 className="text-red-600 text-sm normal-case">{isError}</h1>
					</div> */}
					<div className="flex justify-center my-8">
						<Button
							text="Edit"
							onClick={handleFile}
							customClass="bg-primary rounded-md  text-sm font-semibold text-white !w-24 !h-10"
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default Profile;
