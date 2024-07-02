import React, { useState, useEffect } from 'react';

const App = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    emailId: '',
    password: '',
    firstName: '',
    lastName: '',
    address: '',
    countryCode: '+91',
    phoneNumber: '',
    acceptTermsAndCondition: false,
  });
  const [errors, setErrors] = useState({});
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Validation function for each step
  const validateForm = (step) => {
    let isValid = true;
    switch (step) {
      case 1:
        if (!formData.emailId || !/\S+@\S+\.\S+/.test(formData.emailId)) {
          setErrors({ emailId: 'Please enter a valid email address' });
          isValid = false;
        } else {
          setErrors({}); // Clear errors
        }
        if (!formData.password || !/^((?=.*[A-Z].*[A-Z])(?=.*[a-z].*[a-z])(?=.*\d.*\d)(?=.*[!@#$%^&*()_+}{:;\"'`~\\\/?,.<>|=-]).{8,})/.test(formData.password)) {
          setErrors(prevErrors => ({ ...prevErrors, password: 'Password must contain at least 2 uppercase letters, 2 lowercase letters, 2 digits, and 2 special characters, with a minimum length of 8 characters' }));
          isValid = false;
        } else {
          setErrors(prevErrors => ({ ...prevErrors, password: '' })); // Clear errors
        }
        break;
      case 2:
        if (!formData.firstName || !/^[a-zA-Z]{2,50}$/.test(formData.firstName)) {
          setErrors(prevErrors => ({ ...prevErrors, firstName: 'Please enter a valid first name (2-50 characters, alphabets only)' }));
          isValid = false;
        } else {
          setErrors(prevErrors => ({ ...prevErrors, firstName: '' })); // Clear errors
        }
        if (formData.lastName && !/^[a-zA-Z]*$/.test(formData.lastName)) {
          setErrors(prevErrors => ({ ...prevErrors, lastName: 'Please enter a valid last name (alphabets only)' }));
          isValid = false;
        } else {
          setErrors(prevErrors => ({ ...prevErrors, lastName: '' })); // Clear errors
        }
        if (!formData.address || formData.address.length < 10) {
          setErrors(prevErrors => ({ ...prevErrors, address: 'Please enter a valid address (minimum 10 characters)' }));
          isValid = false;
        } else {
          setErrors(prevErrors => ({ ...prevErrors, address: '' })); // Clear errors
        }
        break;
      case 3:
        if (!formData.countryCode) {
          setErrors(prevErrors => ({ ...prevErrors, countryCode: 'Please select a country code' }));
          isValid = false;
        } else {
          setErrors(prevErrors => ({ ...prevErrors, countryCode: '' })); // Clear errors
        }
        if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) {
          setErrors(prevErrors => ({ ...prevErrors, phoneNumber: 'Please enter a 10-digit numeric phone number' }));
          isValid = false;
        } else {
          setErrors(prevErrors => ({ ...prevErrors, phoneNumber: '' })); // Clear errors
        }
        if (!formData.acceptTermsAndCondition) {
          setErrors(prevErrors => ({ ...prevErrors, acceptTermsAndCondition: 'Please accept the terms and conditions' }));
          isValid = false;
        } else {
          setErrors(prevErrors => ({ ...prevErrors, acceptTermsAndCondition: '' })); // Clear errors
        }
        break;
      default:
        break;
    }
    return isValid;
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: newValue }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const isValid = validateForm(currentStep);
    if (isValid) {
      if (currentStep === 3) {
        submitFormData();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBackClick = () => {
    setCurrentStep(currentStep - 1);
  };

  const submitFormData = () => {
    // Remove acceptTermsAndCondition from formData
    const { acceptTermsAndCondition, ...formDataWithoutTerms } = formData;

    fetch('https://codebuddy.review/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formDataWithoutTerms), // Send formDataWithoutTerms instead of formData
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        fetchPosts(); // Fetch posts after successful submission
        setCurrentStep(4); // For demo purpose, directly show posts after submission
      })
      .catch((error) => console.error('Error submitting form:', error));
  };

  const fetchPosts = () => {
    setLoadingPosts(true); // Set loading state
    fetch('https://codebuddy.review/posts')
      .then((response) => response.json())
      .then((data) => {
        setPosts(data?.data);
        console.log(data);
        setLoadingPosts(false); // Clear loading state
      })
      .catch((error) => {
        setLoadingPosts(false); // Clear loading state in case of error
        console.error('Error fetching posts:', error);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      {currentStep === 1 && (
        <FormComponent
          formData={formData}
          handleInputChange={handleInputChange}
          handleFormSubmit={handleFormSubmit}
          handleBackClick={handleBackClick}
          currentStep={currentStep}
          errors={errors}
          fields={['emailId', 'password']}
        />
      )}
      {currentStep === 2 && (
        <FormComponent
          formData={formData}
          handleInputChange={handleInputChange}
          handleFormSubmit={handleFormSubmit}
          handleBackClick={handleBackClick}
          currentStep={currentStep}
          errors={errors}
          fields={['firstName', 'lastName', 'address']}
        />
      )}
      {currentStep === 3 && (
        <FormComponent
          formData={formData}
          handleInputChange={handleInputChange}
          handleFormSubmit={handleFormSubmit}
          handleBackClick={handleBackClick}
          currentStep={currentStep}
          errors={errors}
          fields={['countryCode', 'phoneNumber', 'acceptTermsAndCondition']}
        />
      )}
      {currentStep === 4 && (
        <div>
          {loadingPosts ? (
            <p>Loading posts...</p>
          ) : (
            <Posts posts={posts} />
          )}
        </div>
      )}
    </div>
  );
};

const FormComponent = ({ formData, handleInputChange, handleFormSubmit, handleBackClick, currentStep, errors, fields }) => {
  return (
    <form onSubmit={handleFormSubmit} className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {fields.includes('emailId') && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email ID:</label>
          <input
            type="email"
            name="emailId"
            value={formData.emailId}
            onChange={handleInputChange}
            className={`shadow appearance-none border ${errors.emailId ? 'border-red-500' : 'border-gray-200'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
          />
          {errors.emailId && <p className="text-red-500 text-xs italic">{errors.emailId}</p>}
        </div>
      )}
      {fields.includes('password') && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`shadow appearance-none border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
          />
          {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
        </div>
      )}
      {fields.includes('firstName') && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`shadow appearance-none border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
          />
          {errors.firstName && <p className="text-red-500 text-xs italic">{errors.firstName}</p>}
        </div>
      )}
      {fields.includes('lastName') && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`shadow appearance-none border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
          />
          {errors.lastName && <p className="text-red-500 text-xs italic">{errors.lastName}</p>}
        </div>
      )}
      {fields.includes('address') && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`shadow appearance-none border ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
          />
          {errors.address && <p className="text-red-500 text-xs italic">{errors.address}</p>}
        </div>
      )}
      {fields.includes('countryCode') && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Country Code:</label>
          <select
            name="countryCode"
            value={formData.countryCode}
            onChange={handleInputChange}
            className={`shadow appearance-none border ${errors.countryCode ? 'border-red-500' : 'border-gray-200'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
          >
            <option value="">Select Country Code</option>
            <option value="+91">India (+91)</option>
            <option value="+1">America (+1)</option>
          </select>
          {errors.countryCode && <p className="text-red-500 text-xs italic">{errors.countryCode}</p>}
        </div>
      )}
      {fields.includes('phoneNumber') && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className={`shadow appearance-none border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs italic">{errors.phoneNumber}</p>}
        </div>
      )}
      {fields.includes('acceptTermsAndCondition') && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            <input
              type="checkbox"
              name="acceptTermsAndCondition"
              checked={formData.acceptTermsAndCondition}
              onChange={handleInputChange}
              className={`mr-2 leading-tight ${errors.acceptTermsAndCondition ? 'border-red-500' : ''}`}
            />
            <span className="text-sm">I accept the terms and conditions</span>
          </label>
          {errors.acceptTermsAndCondition && <p className="text-red-500 text-xs italic">{errors.acceptTermsAndCondition}</p>}
        </div>
      )}
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {currentStep === 3 ? 'Submit' : 'Save and Next'}
        </button>
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleBackClick}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Back
          </button>
        )}
      </div>
    </form>
  );
};

const Posts = ({ posts }) => {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post.id} className="mb-4">
            <img src={post.image} alt={post.writeup} className="w-full h-auto rounded mb-2" />
            <div className="flex items-center mb-2">
              {/* Assuming you have an avatar for each post */}
              <img src={post.avatar} alt={post.firstName} className="w-10 h-10 rounded-full mr-2" />
              <h2 className="text-lg font-semibold">{post.firstName} {post.lastName}</h2>
            </div>
            <p className="text-gray-700">{post.writeup}</p>
          </div>
        ))}
      </div>
    </div>
  );
};



export default App;
