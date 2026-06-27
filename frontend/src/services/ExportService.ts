import api from './api';

const downloadFile = (data: any, filename: string) => {
    const blob = data instanceof Blob ? data : new Blob([data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
};

const exportTeamsCsv = async () => {
    const response = await api.get('/export/teams/csv', { responseType: 'blob' });
    downloadFile(response.data, 'teams_export.csv');
};

const exportParticipantsCsv = async () => {
    const response = await api.get('/export/participants/csv', { responseType: 'blob' });
    downloadFile(response.data, 'participants_export.csv');
};

const exportRoundScoring = async (roundId: number) => {
    const response = await api.get(`/export/rounds/${roundId}/scoring`, { responseType: 'blob' });
    // Assuming the backend returns an excel or csv
    const contentDisposition = response.headers['content-disposition'];
    let filename = `round_${roundId}_scoring.xlsx`;
    if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
    }
    downloadFile(response.data, filename);
};

const exportRoundRanking = async (roundId: number) => {
    const response = await api.get(`/export/rounds/${roundId}/ranking`, { responseType: 'blob' });
    const contentDisposition = response.headers['content-disposition'];
    let filename = `round_${roundId}_ranking.xlsx`;
    if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
    }
    downloadFile(response.data, filename);
};

export const ExportService = {
    exportTeamsCsv,
    exportParticipantsCsv,
    exportRoundScoring,
    exportRoundRanking,
};
