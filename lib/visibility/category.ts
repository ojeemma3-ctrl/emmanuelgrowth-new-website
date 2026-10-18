// Google categories too general to compare a business with "similar" nearby businesses.
// Checked against both the Places type id (language-independent) and the display name (any language).

const GENERIC_TYPES = new Set(['point_of_interest', 'establishment', 'service', 'services', 'business', 'store', 'premise', 'local_business', 'corporate_office']);

const GENERIC_NAMES = new Set([
  // English
  'service', 'services', 'business', 'businesses', 'establishment', 'point of interest', 'store', 'shop', 'company', 'local business',
  // French
  'entreprise', 'société', 'societe', 'établissement', 'etablissement', "point d'intérêt", 'point d’intérêt', 'magasin', 'commerce',
  // Spanish / Portuguese
  'servicio', 'servicios', 'empresa', 'negocio', 'establecimiento', 'serviço', 'serviços', 'estabelecimento', 'tienda', 'loja',
  // German / Dutch / Italian
  'dienstleistung', 'dienstleistungen', 'dienstleister', 'unternehmen', 'geschäft', 'betrieb', 'diensten', 'dienst', 'bedrijf', 'winkel', 'servizi', 'servizio', 'azienda', 'attività', 'negozio',
]);

export function isGenericCategory(type?: string | null, name?: string | null) {
  if (type && GENERIC_TYPES.has(type.toLowerCase())) return true;
  if (!name) return !type;
  return GENERIC_NAMES.has(name.trim().toLowerCase());
}

// Minimum number of same-type nearby businesses before we compare reviews and ratings.
export const MIN_COMPARABLE = 3;
