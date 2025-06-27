import React from 'react';
import { Bot, MessageSquare, Eye, ExternalLink } from 'lucide-react';

interface Alert {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'critical';
  timestamp: string;
}

interface AIAlertsProps {
  alerts: Alert[];
}

export default function AIAlerts({ alerts }: AIAlertsProps) {
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-green-800 flex items-center">
          <Bot className="h-6 w-6 mr-2 text-green-600" />
          Alertas da IA
        </h2>
        <div className="flex space-x-2">
          <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </button>
          <button className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
            <Eye className="h-4 w-4 mr-2" />
            Detalhar
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">{alert.message}</p>
                <p className="text-xs opacity-75">{alert.timestamp}</p>
              </div>
              <ExternalLink className="h-4 w-4 ml-2 opacity-60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}