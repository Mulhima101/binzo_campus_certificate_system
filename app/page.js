'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Download, FileText, Upload, X, Copy, Check, Link2, LogOut, Trash2 } from 'lucide-react';

export default function BinzoCertificateSystem() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedLinks, setGeneratedLinks] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [currentCourse, setCurrentCourse] = useState('');
  const [currentTemplateId, setCurrentTemplateId] = useState('');
  const [currentTemplatePath, setCurrentTemplatePath] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadedTemplates, setUploadedTemplates] = useState([]);
  const [uploading, setUploading] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Default certificate templates
  const defaultTemplates = [
    { id: 'cert1', name: 'Certificate of Human Resource Management', path: '/cert2.jpeg' },
    { id: 'cert2', name: 'Certificate of English Workshop', path: '/cert1.jpeg' }
  ];

  // Load uploaded templates from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('uploadedTemplates');
    if (saved) {
      setUploadedTemplates(JSON.parse(saved));
    }
  }, []);

  // Save uploaded templates to localStorage whenever they change
  useEffect(() => {
    if (uploadedTemplates.length > 0) {
      localStorage.setItem('uploadedTemplates', JSON.stringify(uploadedTemplates));
    }
  }, [uploadedTemplates]);

  // Combine default and uploaded templates
  const allTemplates = [...defaultTemplates, ...uploadedTemplates];

  // Get template by ID
  const getTemplateById = (templateId) => {
    return allTemplates.find(t => t.id === templateId);
  };

  // Check URL parameters on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const course = params.get('course');
      const templateId = params.get('template');
      const templateData = params.get('templateData'); // New: for custom templates
      
      if (course && templateId) {
        setCurrentCourse(decodeURIComponent(course));
        setCurrentTemplateId(templateId);
        
        // If templateData is provided (custom template), use it directly
        if (templateData) {
          setCurrentTemplatePath(decodeURIComponent(templateData));
        } else {
          // For default templates, get from the list
          const template = getTemplateById(templateId);
          if (template) {
            setCurrentTemplatePath(template.path);
          }
        }
        
        setIsAdmin(false);
      }
    }
  }, []);

  // Draw certificate when preview is shown
  useEffect(() => {
    if (showPreview && studentName && currentTemplatePath) {
      setTimeout(() => drawCertificate(studentName, currentTemplatePath), 100);
    }
  }, [showPreview, studentName, currentTemplatePath]);

  const handleAdminLogin = () => {
    if (adminPassword === 'binzo400') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      setCurrentCourse('');
      setCurrentTemplateId('');
      setCurrentTemplatePath('');
    } else {
      alert('Incorrect password');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const templateName = prompt('Enter a name for this certificate template:');
      if (!templateName) {
        setUploading(false);
        return;
      }

      const newTemplate = {
        id: `custom_${Date.now()}`,
        name: templateName,
        path: e.target.result
      };

      setUploadedTemplates(prev => [...prev, newTemplate]);
      setUploading(false);
      alert('Template uploaded successfully!');
    };

    reader.onerror = () => {
      alert('Error uploading file');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const deleteTemplate = (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const newTemplates = uploadedTemplates.filter(t => t.id !== templateId);
      setUploadedTemplates(newTemplates);
      localStorage.setItem('uploadedTemplates', JSON.stringify(newTemplates));
    }
  };

  const generateLink = () => {
    if (!courseName.trim()) {
      alert('Please enter a course name');
      return;
    }
    if (!selectedTemplate) {
      alert('Please select a certificate template');
      return;
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const template = getTemplateById(selectedTemplate);
    
    let link = `${baseUrl}?course=${encodeURIComponent(courseName)}&template=${encodeURIComponent(selectedTemplate)}`;
    
    // If it's a custom template, include the template data in the URL
    if (template && template.id.startsWith('custom_')) {
      link += `&templateData=${encodeURIComponent(template.path)}`;
    }
    
    setGeneratedLinks([...generatedLinks, { 
      course: courseName, 
      link: link, 
      template: selectedTemplate 
    }]);
    
    setCourseName('');
    setSelectedTemplate('');
    setShowCourseForm(false);
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const drawCertificate = (name, templatePath, download = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 800;
      
      ctx.drawImage(img, 0, 0, 1200, 800);
      
      ctx.font = 'bold 40px Georgia, serif';
      ctx.fillStyle = '#1e3a8a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      
      const centerX = canvas.width / 2;
      const nameY = (canvas.height / 2) - 10;
      
      ctx.fillText(name.toUpperCase(), centerX, nameY);

      if (download) {
        downloadCertificateImage(canvas);
      }
    };
    
    img.crossOrigin = 'anonymous';
    img.src = templatePath;
  };

  const downloadCertificateImage = (canvas) => {
    const link = document.createElement('a');
    link.download = `${studentName}_certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadCertificatePDF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { jsPDF } = await import('jspdf');
    
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${studentName}_certificate.pdf`);
  };

  const handleGenerateCertificate = () => {
    if (!studentName.trim()) {
      alert('Please enter your name');
      return;
    }
    setShowPreview(true);
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'certificate.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'My Certificate',
            text: `My certificate from BinzO Campus - ${currentCourse}`
          });
        } catch (err) {
          console.log('Share cancelled');
        }
      } else {
        alert('Sharing not supported on this device. Please download instead.');
      }
    });
  };

  // ADMIN VIEW
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <img src='/binzologo.jpeg' className='rounded-xl' alt="Logo"/>
                </div>
              </div>
              <button
                onClick={() => setIsAdmin(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Certificate Template</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Upload New Template'}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Certificate Link</h2>
            <button
              onClick={() => setShowCourseForm(true)}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition flex items-center justify-center gap-2"
            >
              <Link2 className="w-5 h-5" />
              Generate New Certificate Link
            </button>
          </div>

          {showCourseForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Certificate Details</h3>
                  <button onClick={() => setShowCourseForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                    <input
                      type="text"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="Enter course name..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Certificate Template</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {allTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`cursor-pointer border-4 rounded-lg overflow-hidden transition relative ${
                            selectedTemplate === template.id
                              ? 'border-pink-500 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          {template.id.startsWith('custom_') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTemplate(template.id);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition z-10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <div 
                            onClick={() => setSelectedTemplate(template.id)}
                            className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4"
                          >
                            <img 
                              src={template.path} 
                              alt={template.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="p-3 bg-gray-50">
                            <p className="text-sm font-semibold text-gray-900 text-center">{template.name}</p>
                            {template.id.startsWith('custom_') && (
                              <p className="text-xs text-gray-500 text-center mt-1">Custom Template</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={generateLink}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition"
                  >
                    Generate Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {generatedLinks.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Generated Certificate Links</h2>
              <div className="space-y-4">
                {generatedLinks.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{item.course}</h3>
                      <button
                        onClick={() => copyToClipboard(item.link)}
                        className="px-3 py-1 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition flex items-center gap-2 text-sm"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 break-all">{item.link}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STUDENT VIEW
  if (currentCourse && currentTemplatePath) {
    return (
      <div className="min-h-screen bg-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 bg-white px-6 py-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <img src='/binzologo.jpeg' className='rounded-xl' alt="Logo"/>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BinzO Campus</h1>
                <p className="text-sm text-gray-600">{currentCourse}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="text-pink-700 underline font-medium hover:text-pink-800"
            >
              Admin Login
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Get Your Certificate</h2>
                
                <div className="mb-6">
                  <label className="block text-base font-medium text-gray-900 mb-3">Enter Your Full Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Type your name here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none text-base"
                  />
                </div>

                <button
                  onClick={handleGenerateCertificate}
                  className="w-full py-4 bg-pink-700 text-white rounded-full font-bold text-lg hover:bg-pink-800 transition shadow-md"
                >
                  Generate Certificate
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Live Preview</h3>
                
                {showPreview ? (
                  <div className="space-y-4">
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 flex items-center justify-center">
                      <canvas ref={canvasRef} className="max-w-full h-auto" style={{ maxHeight: '400px' }} />
                    </div>

                    <button
                      onClick={downloadCertificatePDF}
                      className="w-full py-3 bg-pink-700 text-white rounded-full font-bold hover:bg-pink-800 transition"
                    >
                      Download PDF
                    </button>

                    <button
                      onClick={() => drawCertificate(studentName, currentTemplatePath, true)}
                      className="w-full py-3 bg-gray-300 text-gray-800 rounded-full font-bold hover:bg-gray-400 transition"
                    >
                      Download Image
                    </button>

                    <button
                      onClick={handleShare}
                      className="w-full py-3 bg-pink-700 text-white rounded-full font-bold hover:bg-pink-800 transition flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-16 flex items-center justify-center min-h-96">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-gray-800 italic mb-2">John Doe</p>
                      <div className="w-32 h-0.5 bg-gray-800 mx-auto"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
                <button onClick={() => setShowAdminLogin(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                onClick={handleAdminLogin}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LANDING PAGE (or Template Not Found)
  if (currentCourse && !currentTemplatePath) {
    return (
      <div className="min-h-screen bg-gray-200 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Template Not Found</h2>
          <p className="text-gray-600 mb-4">The certificate template could not be found.</p>
          <button
            onClick={() => {
              setCurrentCourse('');
              setCurrentTemplateId('');
              setCurrentTemplatePath('');
              window.history.pushState({}, '', '/');
            }}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <img src='/binzologo.jpeg' className='rounded-xl' alt="Logo"/>
          </div>
          <p className="text-2xl text-pink-100">Campus Certificate System</p>
        </div>

        <button
          onClick={() => setShowAdminLogin(true)}
          className="px-8 py-4 bg-white text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition shadow-xl"
        >
          Admin Login
        </button>

        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
                <button onClick={() => setShowAdminLogin(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                onClick={handleAdminLogin}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}