import { Trophy } from "lucide-react";
export const WelcomeStep = () => (
  <div className="text-center">
    <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
      <Trophy className="w-8 h-8 text-indigo-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">
      Welcome to Sparta Moderator Program
    </h2>
    <div className="text-left space-y-4">
      <p className="text-gray-600 mb-6">
        As a Sparta Moderator, you will play a crucial role in maintaining the
        quality and integrity of our athletic networking platform.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          Your Responsibilities:
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>
              <strong>Oversee matches</strong> between teams and athletes to
              ensure fair play and proper conduct
            </span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>
              <strong>Conduct athlete evaluations</strong> and update physical
              statistics and performance metrics
            </span>
          </li>
        </ul>
      </div>

      <p className="text-gray-600">
        This onboarding process will take approximately 5-10 minutes to
        complete. Please ensure you have all necessary information ready.
      </p>
    </div>
  </div>
);
