// client/src/components/RoomPhotoGallery/index.jsx
import React, { useState } from 'react';
import { API_URL } from '../../config';

const RoomPhotoGallery = ({ photos = [], onDeletePhoto, canDelete = false }) => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openModal = (photo, index) => {
        setSelectedPhoto(photo);
        setCurrentIndex(index);
    };

    const closeModal = () => {
        setSelectedPhoto(null);
        setCurrentIndex(0);
    };

    const nextPhoto = () => {
        const nextIndex = (currentIndex + 1) % photos.length;
        setCurrentIndex(nextIndex);
        setSelectedPhoto(photos[nextIndex]);
    };

    const prevPhoto = () => {
        const prevIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
        setCurrentIndex(prevIndex);
        setSelectedPhoto(photos[prevIndex]);
    };

    const handleDelete = (photoUrl) => {
        if (window.confirm('Are you sure you want to delete this photo?')) {
            onDeletePhoto(photoUrl);
        }
    };

    if (photos.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2">No room photos uploaded yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                        <img
                            src={`${API_URL}${photo}`}
                            alt={`Room photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openModal(photo, index)}
                        />
                        
                        {/* Overlay with delete button */}
                        {canDelete && (
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(photo);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                                    title="Delete photo"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal for full-size photo view */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="relative max-w-4xl max-h-full p-4">
                        {/* Close button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Navigation arrows */}
                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={prevPhoto}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextPhoto}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {/* Photo */}
                        <img
                            src={`${API_URL}${selectedPhoto}`}
                            alt={`Room photo ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />

                        {/* Photo counter */}
                        {photos.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                                {currentIndex + 1} / {photos.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomPhotoGallery; 