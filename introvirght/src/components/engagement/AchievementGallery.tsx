import React, { useState } from 'react';
import type { Achievement } from '../../types/engagement';

interface AchievementGalleryProps {
    achievements: Achievement[];
    className?: string;
}

const AchievementGallery: React.FC<AchievementGalleryProps> = ({
    achievements,
    className = ''
}) => {
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

    const filteredAchievements = achievements.filter(achievement => {
        switch (filter) {
            case 'completed':
                return achievement.completed;
            case 'in_progress':
                return !achievement.completed && achievement.progress > 0;
            default:
                return true;
        }
    });

    const getProgressPercentage = (achievement: Achievement) => {
        return Math.min((achievement.progress / achievement.maxProgress) * 100, 100);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'writing':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                );
            case 'social':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                );
            case 'growth':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                );
            case 'consistency':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                );
            case 'impact':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                );
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'writing': return 'from-blue-500 to-indigo-600';
            case 'social': return 'from-emerald-500 to-teal-600';
            case 'growth': return 'from-purple-500 to-pink-600';
            case 'consistency': return 'from-orange-500 to-red-600';
            case 'impact': return 'from-pink-500 to-rose-600';
            default: return 'from-gray-500 to-slate-600';
        }
    };

    const getCompletionStats = () => {
        const completed = achievements.filter(a => a.completed).length;
        const total = achievements.length;
        const inProgress = achievements.filter(a => !a.completed && a.progress > 0).length;

        return { completed, total, inProgress };
    };

    const stats = getCompletionStats();

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-serif font-semibold text-stone-800">
                        Achievement Gallery
                    </h2>
                    <p className="text-sm text-stone-600">
                        {stats.completed} of {stats.total} achievements completed • {stats.inProgress} in progress
                    </p>
                </div>

                {/* Completion Progress */}
                <div className="text-center">
                    <div className="text-2xl font-bold text-sage-600">
                        {Math.round((stats.completed / stats.total) * 100)}%
                    </div>
                    <div className="text-xs text-stone-500">Complete</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {(['all', 'completed', 'in_progress'] as const).map((filterType) => (
                    <button
                        key={filterType}
                        onClick={() => setFilter(filterType)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === filterType
                            ? 'bg-sage-600 text-white shadow-md'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                    >
                        {filterType === 'all' ? 'All' :
                            filterType === 'completed' ? 'Completed' : 'In Progress'}
                    </button>
                ))}
            </div>

            {/* Achievement Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        onClick={() => setSelectedAchievement(achievement)}
                        className={`card-gentle cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${achievement.completed
                            ? 'bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 border-2 border-gradient-to-r from-emerald-200 to-purple-200 shadow-lg'
                            : 'hover:border-blue-300 hover:shadow-blue-100'
                            }`}
                    >
                        <div className="space-y-4">
                            {/* Achievement Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`
                    w-12 h-12 rounded-lg bg-gradient-to-br ${getCategoryColor(achievement.category)}
                    flex items-center justify-center text-white shadow-md
                    ${achievement.completed ? '' : 'opacity-60'}
                  `}>
                                        {getCategoryIcon(achievement.category)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-semibold ${achievement.completed ? 'text-sage-800' : 'text-stone-700'
                                            }`}>
                                            {achievement.name}
                                        </h3>
                                        <p className="text-sm text-stone-600 capitalize">
                                            {achievement.category}
                                        </p>
                                    </div>
                                </div>

                                {/* Completion Status */}
                                {achievement.completed && (
                                    <div className="flex items-center space-x-1 text-sage-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-stone-600 leading-relaxed">
                                {achievement.description}
                            </p>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-stone-700">
                                        Progress
                                    </span>
                                    <span className="text-sm text-stone-600">
                                        {achievement.progress} / {achievement.maxProgress}
                                    </span>
                                </div>

                                <div className="w-full bg-stone-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${achievement.completed
                                            ? 'bg-gradient-to-r from-sage-500 to-sage-600'
                                            : 'bg-gradient-to-r from-stone-400 to-stone-500'
                                            }`}
                                        style={{ width: `${getProgressPercentage(achievement)}%` }}
                                    />
                                </div>

                                <div className="text-center">
                                    <span className="text-xs text-stone-500">
                                        {Math.round(getProgressPercentage(achievement))}% complete
                                    </span>
                                </div>
                            </div>

                            {/* Rewards Preview */}
                            <div className="border-t border-stone-200 pt-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-stone-600">Rewards:</span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sage-600 font-medium">
                                            +{achievement.rewards.experience} XP
                                        </span>
                                        {achievement.rewards.badges && achievement.rewards.badges.length > 0 && (
                                            <span className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full">
                                                Badge
                                            </span>
                                        )}
                                        {achievement.rewards.unlocks && achievement.rewards.unlocks.length > 0 && (
                                            <span className="text-xs bg-lavender-100 text-lavender-700 px-2 py-1 rounded-full">
                                                Unlock
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Completion Date */}
                            {achievement.completed && achievement.completedAt && (
                                <div className="text-xs text-stone-500 text-center">
                                    Completed on {new Date(achievement.completedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredAchievements.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-stone-700 mb-2">
                        No {filter === 'all' ? '' : filter.replace('_', ' ')} achievements
                    </h3>
                    <p className="text-stone-600 text-sm">
                        {filter === 'completed'
                            ? 'Complete your first achievement by engaging with the community!'
                            : filter === 'in_progress'
                                ? 'Start working towards achievements to see your progress here.'
                                : 'Begin your mindful journey to unlock achievements!'
                        }
                    </p>
                </div>
            )}

            {/* Achievement Detail Modal */}
            {selectedAchievement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-6">
                        {/* Achievement Header */}
                        <div className="text-center">
                            <div className={`
                w-20 h-20 mx-auto rounded-xl bg-gradient-to-br ${getCategoryColor(selectedAchievement.category)}
                flex items-center justify-center text-white shadow-lg mb-4
                ${selectedAchievement.completed ? '' : 'opacity-60'}
              `}>
                                <div className="text-2xl">
                                    {getCategoryIcon(selectedAchievement.category)}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-stone-800 mb-2">
                                {selectedAchievement.name}
                            </h3>

                            <div className="flex items-center justify-center space-x-2 mb-4">
                                <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm capitalize">
                                    {selectedAchievement.category}
                                </span>
                                {selectedAchievement.completed && (
                                    <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm font-medium">
                                        Completed
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="text-center">
                            <p className="text-stone-600 leading-relaxed">
                                {selectedAchievement.description}
                            </p>
                        </div>

                        {/* Progress */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-stone-700">Progress</span>
                                <span className="text-stone-600">
                                    {selectedAchievement.progress} / {selectedAchievement.maxProgress}
                                </span>
                            </div>

                            <div className="w-full bg-stone-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${selectedAchievement.completed
                                        ? 'bg-gradient-to-r from-sage-500 to-sage-600'
                                        : 'bg-gradient-to-r from-stone-400 to-stone-500'
                                        }`}
                                    style={{ width: `${getProgressPercentage(selectedAchievement)}%` }}
                                />
                            </div>

                            <div className="text-center text-sm text-stone-500">
                                {Math.round(getProgressPercentage(selectedAchievement))}% complete
                            </div>
                        </div>

                        {/* Rewards */}
                        <div className="bg-stone-50 rounded-lg p-4">
                            <h4 className="font-semibold text-stone-800 mb-3">Rewards</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-stone-600">Experience Points</span>
                                    <span className="font-medium text-sage-600">
                                        +{selectedAchievement.rewards.experience} XP
                                    </span>
                                </div>

                                {selectedAchievement.rewards.badges && selectedAchievement.rewards.badges.length > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-stone-600">Badges</span>
                                        <span className="text-sm bg-sage-100 text-sage-700 px-2 py-1 rounded-full">
                                            {selectedAchievement.rewards.badges.length} badge{selectedAchievement.rewards.badges.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}

                                {selectedAchievement.rewards.unlocks && selectedAchievement.rewards.unlocks.length > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-stone-600">Feature Unlocks</span>
                                        <span className="text-sm bg-lavender-100 text-lavender-700 px-2 py-1 rounded-full">
                                            {selectedAchievement.rewards.unlocks.length} feature{selectedAchievement.rewards.unlocks.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Completion Date */}
                        {selectedAchievement.completed && selectedAchievement.completedAt && (
                            <div className="text-center text-sm text-stone-500">
                                Completed on {new Date(selectedAchievement.completedAt).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        )}

                        {/* Close Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={() => setSelectedAchievement(null)}
                                className="btn-primary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementGallery;