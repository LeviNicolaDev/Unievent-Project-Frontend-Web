import { getAssetUrl } from '../utils/formatters.js';

export const responsiblePeople = [
  { id: 1, name: 'Ryan Dias', avatar: getAssetUrl('perfil.jpg') },
  { id: 2, name: 'Claudio Rodrigues', avatar: getAssetUrl('foto claudio.jpeg') },
  { id: 3, name: 'Levi Nicola', avatar: getAssetUrl('foto levi.jpg') },
];

export const events = [
  {
    id: 1,
    title: 'The Rock - 5º Edição',
    responsible: 'Ryan Dias',
    category: 'Música',
    date: '2026-01-25',
    time: '19:00',
    image: getAssetUrl('evento.png'),
    description:
      'Show de rock com banda formada por alunos dos cursos de GPI, ADS e GE. Entrada gratuita com arrecadação solidária.',
    capacity: 180,
  },
  {
    id: 2,
    title: 'Palestra de Tecnologia',
    responsible: 'Claudio Rodrigues',
    category: 'Palestra',
    date: '2026-02-12',
    time: '14:00',
    image: getAssetUrl('uploads/68ebc959e8143_12.PNG'),
    description: 'Encontro institucional sobre tecnologia, inovação e carreira.',
    capacity: 120,
  },
];

export const certificates = [
  {
    id: 1,
    certificateDate: '2026-01-26',
    text: 'Certificamos a participação no evento The Rock - 5º Edição.',
    eventId: 1,
    studentId: 1024,
  },
  {
    id: 2,
    certificateDate: '2026-02-13',
    text: 'Certificamos a participação na Palestra de Tecnologia.',
    eventId: 2,
    studentId: 2048,
  },
];
