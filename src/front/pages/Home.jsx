import React, { useEffect } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	useEffect(() => {
		loadMessage()
	}, [])

	return (
		<div className="container-fluid min-vh-100 px-0 position-relative" style={{ backgroundColor: "#fdf6f0", overflow: "hidden" }}>
			{/* Imágenes decorativas */}
			<img src="public/img/FONDO CAFE.png" alt="Decoración"
				className="position-absolute top-0 start-0 opacity-25"
				style={{ width: "800px", zIndex: 0 }} />

			<img src="public/img/FONDO PLANTAS.png" alt="Decoración"
				className="position-absolute bottom-0 end-0 opacity-25"
				style={{ width: "800px", zIndex: 0 }} />

			<div className="container py-5 position-relative" style={{ zIndex: 1 }}>
				{/* Logo */}
				<div className="row justify-content-center mb-4">
					<div className="col-12 text-center">
						<img src="public/img/LOGO MARRON OSCURO.png" alt="Logo" style={{ maxHeight: "400px" }} />
					</div>
				</div>

				{/* Hero Section */}
				<div className="row justify-content-center text-center mb-5">
					<div className="col-lg-8 col-md-10">
						<h1 className="display-5 fw-bold" style={{ color: "#5a3e2b" }}>
							Café de Especialidad, Directo del Origen
						</h1>
						<p className="lead" style={{ color: "#5a3e2b" }}>
							En nuestra empresa apostamos por un café auténtico, sin aditivos y con trazabilidad.
							Llevamos hasta tu taza lo mejor de los cafetales de origen, cuidando cada detalle del proceso.
						</p>
					</div>
				</div>

				{/* Producto destacado */}
				<div className="row justify-content-center mb-5">
					<div className="col-12 col-lg-10">
						<div className="card border-0 rounded-4 shadow-sm" style={{ backgroundColor: "#fff4eb" }}>
							<div className="row g-0">
								<div className="col-md-6">
									<img src="public/img/FONDO TAZA CAFE.png" alt="Café de especialidad" className="img-fluid rounded-start w-100 h-100" />
								</div>
								<div className="col-md-6 d-flex align-items-center">
									<div className="card-body">
										<h5 className="card-title" style={{ color: "#5a3e2b" }}>¿Qué es el café de especialidad?</h5>
										<p className="card-text" style={{ color: "#5a3e2b" }}>
											Es un café cultivado en condiciones ideales, con un sabor único, libre de defectos y cuidadosamente procesado.
											Ofrecemos granos seleccionados, tostados con precisión para revelar sus notas auténticas.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Misión */}
				<div className="row justify-content-center text-center mt-4">
					<div className="col-lg-8 col-md-10">
						<h2 style={{ color: "#5a3e2b" }}>Nuestra Misión</h2>
						<p className="mt-3" style={{ color: "#5a3e2b" }}>
							Conectar a productores locales con personas que valoran la calidad, el origen y la transparencia.
							Somos más que una marca: somos un puente entre la tierra y tu paladar.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}; 
