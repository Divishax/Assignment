export const getTypeColorClass = (type: string) => {
    switch (type) {
        case 'normal': return 'bg-gray-400 text-white';
        case 'fire': return 'bg-red-500 text-white';
        case 'water': return 'bg-blue-500 text-white';
        case 'grass': return 'bg-green-500 text-white';
        case 'electric': return 'bg-yellow-500 text-gray-800';
        case 'ice': return 'bg-blue-200 text-gray-800';
        case 'fighting': return 'bg-red-700 text-white';
        case 'poison': return 'bg-purple-600 text-white';
        case 'ground': return 'bg-yellow-700 text-white';
        case 'flying': return 'bg-indigo-400 text-white';
        case 'psychic': return 'bg-pink-500 text-white';
        case 'bug': return 'bg-lime-600 text-white';
        case 'rock': return 'bg-gray-700 text-white';
        case 'ghost': return 'bg-purple-800 text-white';
        case 'dragon': return 'bg-indigo-700 text-white';
        case 'steel': return 'bg-gray-500 text-white';
        case 'fairy': return 'bg-pink-300 text-gray-800';
        default: return 'bg-gray-300 text-gray-800';
    }
};