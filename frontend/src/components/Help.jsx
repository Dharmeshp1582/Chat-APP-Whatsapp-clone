import React from "react";
import { FaArrowLeft } from "react-icons/fa";

const Help = () => {
  return (
    <div className="mt-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <FaArrowLeft className="absolute top-12 left-20  cursor-pointer w-6 h-6" onClick={() => window.history.back()} />

      <h1 className="text-3xl font-semibold text-center mx-auto text-green-600">
        About Our WhatsApp
      </h1>

      <p className="text-sm text-slate-500 text-center mt-2 max-w-md mx-auto">
        A real-time chat application built with the MERN stack, offering a fast,
        secure, and modern messaging experience.
      </p>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 px-4 md:px-0 py-10">
        <img
          className="max-w-sm w-full rounded-xl h-auto shadow-lg"
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp Clone"
        />

        <div>
          <h1 className="text-3xl font-semibold text-green-600">
            Key Features
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Designed using MongoDB, Express, React, and Node.js — bringing
            real-time communication with Socket.io integration and modern UI
            styling using Tailwind CSS.
          </p>

          <div className="flex flex-col gap-10 mt-6">
            {/* Feature 1 */}
            <div className="flex items-center gap-4">
              <div className="size-9 p-2 bg-green-50 border border-green-200 rounded">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/724/724715.png"
                  alt="Chat Icon"
                />
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-600">
                  Real-Time Messaging
                </h3>
                <p className="text-sm text-slate-500">
                  Powered by Socket.io for instant message delivery and live
                  updates.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4">
              <div className="size-9 p-2 bg-green-50 border border-green-200 rounded">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3291/3291669.png"
                  alt="MERN Stack Icon"
                />
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-600">
                  Built with MERN Stack
                </h3>
                <p className="text-sm text-slate-500">
                  Fully functional backend and frontend using MongoDB, Express,
                  React, and Node.js.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4">
              <div className="size-9 p-2 bg-green-50 border border-green-200 rounded">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
                  alt="UI Icon"
                />
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-600">
                  Modern UI Design
                </h3>
                <p className="text-sm text-slate-500">
                  Clean, responsive, and WhatsApp-like interface built with
                  Tailwind CSS.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-4">
              <div className="size-9 p-2 bg-green-50 border border-green-200 rounded">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="User Icon"
                />
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-600">
                  Authentication & Security
                </h3>
                <p className="text-sm text-slate-500">
                  Secure login system using JWT authentication and user data
                  protection.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex items-center gap-4">
              <div className="size-9 p-2 bg-green-50 border border-green-200 rounded">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3983/3983197.png"
                  alt="Responsive Icon"
                />
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-600">
                  Responsive & Cross-Platform
                </h3>
                <p className="text-sm text-slate-500">
                  Works seamlessly on all devices — desktop, tablet, and mobile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
