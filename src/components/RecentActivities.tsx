import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleViewAllActivities = () => {
    navigate('/new-activity');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-green-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold text-green-800 flex items-center">
          <Activity className="h-6 w-6 mr-2 text-green-600" />
          Atividades Recentes
        </h2>
        <button 
          onClick={handleViewAllActivities}
          className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Todas
        </button>
      </div>

      <div className="space-y-3 lg:space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 lg:p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
              <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                <div className="bg-green-600 p-2 rounded-full flex-shrink-0">
                  <Activity className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-green-800 text-sm lg:text-base truncate">{activity.name}</p>
                  <p className="text-xs lg:text-sm text-green-600">{activity.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 lg:space-x-2 text-green-700 flex-shrink-0 ml-2">
                <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-xs lg:text-sm font-medium">{activity.date}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma atividade recente</h3>
            <p className="text-sm text-gray-500">
              Suas atividades aparecerão aqui quando você começar a cadastrá-las.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}