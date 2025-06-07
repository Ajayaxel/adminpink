import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

const userData = [
	{ id: 1, name: "John Doe", email: "john@example.com", role: "Customer", status: "Active" },
	{ id: 2, name: "Jane Smith", email: "jane@example.com", role: "Admin", status: "Active" },
	{ id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Customer", status: "Inactive" },
	{ id: 4, name: "Alice Brown", email: "alice@example.com", role: "Customer", status: "Active" },
	{ id: 5, name: "Charlie Wilson", email: "charlie@example.com", role: "Moderator", status: "Active" },
];

const UsersTable = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredUsers, setFilteredUsers] = useState(userData);
	const [showForm, setShowForm] = useState(false);
	const [formMode, setFormMode] = useState("create"); // "create" or "edit"
	const [formValues, setFormValues] = useState({
		id: null,
		name: "",
		email: "",
		role: "",
		status: ""
	});

	const handleSearch = (e) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);
		const filtered = userData.filter(
			(user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
		);
		setFilteredUsers(filtered);
	};

	const handleDelete = (id) => {
		setFilteredUsers(filteredUsers.filter((user) => user.id !== id));
	};

	const handleEdit = (user) => {
		setFormMode("edit");
		setFormValues({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			status: user.status
		});
		setShowForm(true);
	};

	const handleFormSubmit = (e) => {
		e.preventDefault();
		
		if (formMode === "edit") {
			// Update existing user
			const updatedUsers = filteredUsers.map((user) => 
				user.id === formValues.id ? { ...formValues } : user
			);
			setFilteredUsers(updatedUsers);
		} else {
			// Create new user
			const newUser = {
				...formValues,
				id: Math.max(...filteredUsers.map(user => user.id)) + 1
			};
			setFilteredUsers([...filteredUsers, newUser]);
		}
		
		// Reset form and close it
		handleFormClose();
	};

	const handleFormClose = () => {
		setShowForm(false);
		setFormValues({
			id: null,
			name: "",
			email: "",
			role: "",
			status: ""
		});
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormValues({
			...formValues,
			[name]: value
		});
	};

	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-semibold text-gray-100'>Users</h2>
				<div className='flex items-center space-x-4'>
					<div className='relative'>
						<input
							type='text'
							placeholder='Search users...'
							className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
							value={searchTerm}
							onChange={handleSearch}
						/>
						<Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
					</div>
					{/* <button 
						onClick={() => {
							setFormMode("create");
							setShowForm(true);
						}}
						className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
					>
						Add User
					</button> */}
				</div>
			</div>

			{showForm && (
				<motion.div 
					className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<motion.div 
						className='bg-gray-800 p-6 rounded-xl w-full max-w-md'
						initial={{ scale: 0.9 }}
						animate={{ scale: 1 }}
					>
						<div className='flex justify-between items-center mb-4'>
							<h3 className='text-lg font-semibold text-white'>
								{formMode === "edit" ? "Edit User" : "Add New User"}
							</h3>
							<button onClick={handleFormClose} className='text-gray-400 hover:text-white'>
								<X size={20} />
							</button>
						</div>
						
						<form onSubmit={handleFormSubmit}>
							<div className='mb-4'>
								<label className='block text-gray-300 text-sm font-medium mb-2'>
									Name
								</label>
								<input
									type='text'
									name='name'
									value={formValues.name}
									onChange={handleInputChange}
									className='w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white'
									required
								/>
							</div>
							
							<div className='mb-4'>
								<label className='block text-gray-300 text-sm font-medium mb-2'>
									Email
								</label>
								<input
									type='email'
									name='email'
									value={formValues.email}
									onChange={handleInputChange}
									className='w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white'
									required
								/>
							</div>
							
							<div className='mb-4'>
								<label className='block text-gray-300 text-sm font-medium mb-2'>
									Role
								</label>
								<select
									name='role'
									value={formValues.role}
									onChange={handleInputChange}
									className='w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white'
									required
								>
									<option value="" disabled>Select role</option>
									<option value="Customer">Customer</option>
									<option value="Admin">Admin</option>
									<option value="Moderator">Moderator</option>
								</select>
							</div>
							
							<div className='mb-6'>
								<label className='block text-gray-300 text-sm font-medium mb-2'>
									Status
								</label>
								<select
									name='status'
									value={formValues.status}
									onChange={handleInputChange}
									className='w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white'
									required
								>
									<option value="" disabled>Select status</option>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
								</select>
							</div>
							
							<div className='flex justify-end space-x-3'>
								<button
									type='button'
									onClick={handleFormClose}
									className='px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700'
								>
									Cancel
								</button>
								<button
									type='submit'
									className='px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700'
								>
									{formMode === "edit" ? "Save Changes" : "Add User"}
								</button>
							</div>
						</form>
					</motion.div>
				</motion.div>
			)}

			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-700'>
					<thead>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
								Name
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
								Email
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
								Role
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
								Status
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-gray-700'>
						{filteredUsers.map((user) => (
							<motion.tr
								key={user.id}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3 }}
							>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='flex items-center'>
										<div className='flex-shrink-0 h-10 w-10'>
											<div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
												{user.name.charAt(0)}
											</div>
										</div>
										<div className='ml-4'>
											<div className='text-sm font-medium text-gray-100'>{user.name}</div>
										</div>
									</div>
								</td>

								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-gray-300'>{user.email}</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100'>
										{user.role}
									</span>
								</td>

								<td className='px-6 py-4 whitespace-nowrap'>
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
											user.status === "Active"
												? "bg-green-800 text-green-100"
												: "bg-red-800 text-red-100"
										}`}
									>
										{user.status}
									</span>
								</td>

								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
									<button 
										onClick={() => handleEdit(user)} 
										className='text-indigo-400 hover:text-indigo-300 mr-2'
									>
										Edit
									</button>
									<button 
										onClick={() => handleDelete(user.id)} 
										className='text-red-400 hover:text-red-300'
									>
										Delete
									</button>
								</td>
							</motion.tr>
						))}
					</tbody>
				</table>
			</div>
		</motion.div>
	);
};
export default UsersTable;
