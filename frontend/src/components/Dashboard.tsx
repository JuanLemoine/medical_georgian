import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const recentDocuments = [
    { id: '1', title: 'ფორმა IV-100ა', patient: 'გიორგი მაისურაძე', date: '2025-02-24', status: 'დასრულებული' },
    { id: '2', title: 'ფორმა IV-106ა', patient: 'ნათია კვირკველია', date: '2025-02-20', status: 'დასრულებული' },
    { id: '3', title: 'ფორმა IV-100ა', patient: 'ლევან გოგიჩაშვილი', date: '2025-02-18', status: 'დრაფტი' },
  ];
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">გამარჯობა, ექიმო დავით</h1>
      <p className="text-gray-600 mb-8">აირჩიეთ დოკუმენტის შაბლონი რომელზეც გსურთ მუშაობა</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/recording"
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg cursor-pointer transition duration-200"
        >
          <div className="flex items-start mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold">ფორმა IV-100ა</h3>
              <p className="text-sm text-gray-600">ამბულატორიული პაციენტის სამედიცინო ბარათი</p>
            </div>
          </div>
          
          <p className="text-gray-700 text-sm">
            ფორმა IV-100ა გამოიყენება ამბულატორიული პაციენტების სამედიცინო მონაცემების დოკუმენტირებისთვის.
          </p>
        </Link>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg cursor-pointer transition duration-200">
          <div className="flex items-start mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold">ფორმა IV-106ა</h3>
              <p className="text-sm text-gray-600">მიმართვა სპეციალისტთან</p>
            </div>
          </div>
          
          <p className="text-gray-700 text-sm">
            ფორმა IV-106ა გამოიყენება პაციენტის მიმართვისთვის სხვა სპეციალისტთან კონსულტაციისთვის.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg cursor-pointer transition duration-200">
          <div className="flex items-start mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold">ფორმა IV-200ა</h3>
              <p className="text-sm text-gray-600">სტაციონარული პაციენტის სამედიცინო ბარათი</p>
            </div>
          </div>
          
          <p className="text-gray-700 text-sm">
            ფორმა IV-200ა გამოიყენება სტაციონარული პაციენტების სამედიცინო მონაცემების დოკუმენტირებისთვის.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">ბოლო ტრანსკრიფციები</h2>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  დოკუმენტი
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  თარიღი
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  პაციენტი
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  სტატუსი
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doc.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doc.patient}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doc.status === 'დასრულებული' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;