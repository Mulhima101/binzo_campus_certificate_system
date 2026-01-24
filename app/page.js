'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Download, FileText, Upload, X, Copy, Check, Link2, LogOut } from 'lucide-react';

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
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  // Certificate templates
  const templates = [
    { id: 'cert1', name: 'Certificate of Appreciation (Blue)', path: '/cert1.jpeg' },
    { id: 'cert2', name: 'Certificate of Participation (Pink)', path: '/cert2.jpeg' }
  ];

  // Check URL parameters on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const course = params.get('course');
      const template = params.get('template');
      
      if (course && template) {
        setCurrentCourse(decodeURIComponent(course));
        setCurrentTemplate(template);
        setIsAdmin(false);
      }
    }
  }, []);

  // Draw certificate when preview is shown
  useEffect(() => {
    if (showPreview && studentName && currentTemplate) {
      setTimeout(() => drawCertificate(studentName), 100);
    }
  }, [showPreview, studentName, currentTemplate]);

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      setCurrentCourse('');
    } else {
      alert('Incorrect password');
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
    const link = `${baseUrl}?course=${encodeURIComponent(courseName)}&template=${selectedTemplate}`;
    
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

  const drawCertificate = (name, download = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 800;
      
      ctx.drawImage(img, 0, 0, 1200, 800);
      
      // Draw student name based on template
      ctx.font = 'bold 70px Georgia, serif';
      ctx.fillStyle = currentTemplate === 'cert1' ? '#1e3a8a' : '#1f2937';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.fillText(name, centerX, centerY);

      if (download) {
        downloadCertificate(canvas);
      }
    };
    
    img.crossOrigin = 'anonymous';
    img.src = currentTemplate;
  };

  const downloadCertificate = (canvas) => {
    const link = document.createElement('a');
    link.download = `${studentName}_certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
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
          {/* Admin Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">BinzO Campus</h1>
                  <p className="text-sm text-gray-600">Admin - Certificate Management</p>
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

          {/* Create Certificate Link Button */}
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

          {/* Course Form Modal */}
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
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.path)}
                          className={`cursor-pointer border-4 rounded-lg overflow-hidden transition ${
                            selectedTemplate === template.path
                              ? 'border-pink-500 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
                            <div className="text-center">
                              <FileText className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                              <p className="text-xs text-gray-500">Template Preview</p>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50">
                            <p className="text-sm font-semibold text-gray-900 text-center">{template.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Note: Upload your certificate images as cert1.jpeg and cert2.jpeg in the public folder</p>
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

          {/* Generated Links */}
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
  if (currentCourse && currentTemplate) {
    return (
      <div className="min-h-screen bg-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 bg-white px-6 py-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-gray-800 rounded flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-800" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">BinzO Certificates</h1>
            </div>
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="text-pink-700 underline font-medium hover:text-pink-800"
            >
              Admin Login
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left Side - Student Form */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Student: Get Your Certificate</h2>
                
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

              {/* Right Side - Preview */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Live Preview</h3>
                
                {showPreview ? (
                  <div className="space-y-4">
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 flex items-center justify-center">
                      <canvas ref={canvasRef} className="max-w-full h-auto" style={{ maxHeight: '400px' }} />
                    </div>

                    <button
                      onClick={() => drawCertificate(studentName, true)}
                      className="w-full py-3 bg-pink-700 text-white rounded-full font-bold hover:bg-pink-800 transition"
                    >
                      Download PDF
                    </button>

                    <button
                      onClick={() => drawCertificate(studentName, true)}
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

        {/* Admin Login Modal */}
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

              <p className="text-xs text-gray-500 mt-4 text-center">Default password: admin123</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LANDING PAGE
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">B</span>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">BINZO</h1>
          <p className="text-2xl text-pink-100">Campus Certificate System</p>
        </div>

        <button
          onClick={() => setShowAdminLogin(true)}
          className="px-8 py-4 bg-white text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition shadow-xl"
        >
          Admin Login
        </button>

        {/* Admin Login Modal */}
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

              <p className="text-xs text-gray-500 mt-4 text-center">Default password: admin123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}