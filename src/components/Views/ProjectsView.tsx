import React from 'react';
import { Folder } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';

export const ProjectsView: React.FC = () => {
  const { tasks } = useTask();

  // Group tasks by category
  const projectStats = tasks.reduce((acc, task) => {
    const category = task.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {} as Record<string, number>);

  const projects = Object.entries(projectStats).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-4 md:p-8">
      {projects.length === 0 ? (
        <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-500">
          No projects yet. Add a category to your tasks to see them here!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(([project, count]) => (
            <div key={project} className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4 cursor-pointer hover:border-blue-500 transition-colors">
              <div className="bg-blue-50 p-4 rounded-full text-blue-600">
                <Folder className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{project}</h3>
                <p className="text-sm text-slate-500">{count} task{count !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
