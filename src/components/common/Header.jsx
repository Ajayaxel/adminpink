import { useNavigate } from "react-router-dom";

const Header = ({ title, user }) => {
	const navigate = useNavigate();

	return (
		<header className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700">
			<div className="max-w-10xl mx-auto py-4 px-4 flex justify-between sm:px-6 lg:px-8">
				<h1 className="text-2xl font-semibold text-gray-100">{title}</h1>

		
			</div>
		</header>
	);
};

export default Header;

