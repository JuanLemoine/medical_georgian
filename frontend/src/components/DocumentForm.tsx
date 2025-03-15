import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface FormSection {
  title: string;
  content: string;
  subsections?: FormSubsection[];
}

interface FormSubsection {
  title: string;
  content: string;
}

interface FormData {
  document: string;
  sections: FormSection[];
}

const DocumentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [transcription, setTranscription] = useState('');
  const [selectedTab, setSelectedTab] = useState('filled');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch form data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get form data
        const formResponse = await axios.get(`${API_URL}/get-form`);
        setFormData(formResponse.data);
        
        // Get transcription
        const transcriptionResponse = await axios.get(`${API_URL}/get-transcription`);
        setTranscription(transcriptionResponse.data.transcription);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('დოკუმენტის ჩატვირთვა ვერ მოხერხდა');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Handle form field changes
  const handleContentChange = (sectionIndex: number, content: string) => {
    if (!formData) return;
    
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].content = content;
    
    setFormData({
      ...formData,
      sections: updatedSections
    });
  };
  
  // Handle subsection content changes
  const handleSubsectionChange = (sectionIndex: number, subsectionIndex: number, content: string) => {
    if (!formData) return;
    
    const updatedSections = [...formData.sections];
    if (updatedSections[sectionIndex].subsections) {
      updatedSections[sectionIndex].subsections![subsectionIndex].content = content;
      
      setFormData({
        ...formData,
        sections: updatedSections
      });
    }
  };
  
  // Save the form
  const handleSave = async () => {
    try {
      await axios.post(`${API_URL}/save-form`, formData);
      alert('დოკუმენტი წარმატებით შეინახა');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('დოკუმენტის შენახვა ვერ მოხერხდა');
    }
  };
  
  // Save and navigate to history
  const handleFinish = async () => {
    try {
      await axios.post(`${API_URL}/save-form`, formData);
      navigate('/history');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('დოკუმენტის შენახვა ვერ მოხერხდა');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error || !formData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error || 'დოკუმენტის ჩატვირთვა ვერ მოხერხდა'}</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ფორმა IV-100ა</h1>
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded-md ${selectedTab === 'filled' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            onClick={() => setSelectedTab('filled')}
          >
            შევსებული ფორმა
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${selectedTab === 'original' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            onClick={() => setSelectedTab('original')}
          >
            ორიგინალი ტრანსკრიფცია
          </button>
        </div>
      </div>
      
      {selectedTab === 'filled' ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500">საქართველოს შრომის, ჯანმრთელობისა</p>
            <p className="text-sm text-gray-500">და სოციალური დაცვის მინისტრის</p>
            <p className="text-sm text-gray-500">2007 წ.9 აგვისტოს № 338/ნ ბრძანებით</p>
            <h2 className="text-xl font-bold mt-4">სამედიცინო დოკუმენტაცია ფორმა № IV – 100/ა</h2>
            <h3 className="text-lg font-medium mt-2">ცნობა</h3>
            <p className="mt-2">ჯანმრთელობის მდგომარეობის შესახებ</p>
          </div>
          
          <div className="space-y-6">
            {formData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {section.title}
                </label>
                
                {section.subsections ? (
                  <div className="space-y-4">
                    {section.subsections.map((subsection, subsectionIndex) => (
                      <div key={subsectionIndex}>
                        <label className="block text-sm text-gray-700 mb-1">
                          {subsection.title}
                        </label>
                        <textarea 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows={subsection.title.includes('მკურნალობა') ? 4 : 2}
                          value={subsection.content}
                          onChange={(e) => handleSubsectionChange(sectionIndex, subsectionIndex, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={section.title.includes('შენიშვნები') || section.title.includes('მიზანი') ? 3 : 1}
                    value={section.content}
                    onChange={(e) => handleContentChange(sectionIndex, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mr-2"
              onClick={handleSave}
            >
              დრაფტის შენახვა
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleFinish}
            >
              ხელმოწერა და შენახვა
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-lg font-medium mb-4">ორიგინალი ტრანსკრიფცია</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="whitespace-pre-line">
              {transcription || 'ტრანსკრიფცია არ არის ხელმისაწვდომი'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentForm;