import React from 'react';
import { Activity, Clock, Eye } from 'lucide-react';

interface ActivityItem {
  id: string;
  name: string;
  type: string;
  date: string;
}

interface RecentActivitiesProps {
  activities: ActivityItem[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-green-800 flex items-center">
          <Activity className="h-6 w-6 mr-2 text-green-600" />
          Atividades Recentes
        </h2>
        <button className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
          <Eye className="h-4 w-4 mr-2" />
          Ver Todas
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-2 rounded-full">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-800">{activity.name}</p>
                <p className="text-sm text-green-600">{activity.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{activity.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}