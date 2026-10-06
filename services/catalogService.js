const fs = require('fs');
const path = require('path');

const titlesPath = path.join(__dirname, '..', 'data', 'titles.json');
const plansPath = path.join(__dirname, '..', 'data', 'plans.json');
const faqPath = path.join(__dirname, '..', 'data', 'faq.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[：:・·,，。.!！?？「」『』（）()\-—_\s]/g, '');
}

function getTitles() {
  return readJson(titlesPath);
}

function getPlans() {
  return readJson(plansPath);
}

function getFaq() {
  return readJson(faqPath);
}

function searchTitles(query) {
  const q = normalize(query);
  if (!q) return [];

  return getTitles()
    .map((item) => {
      const candidates = [item.title, ...(item.aliases || [])];
      const exact = candidates.some((name) => normalize(name) === q);
      const partial = candidates.some((name) => {
        const n = normalize(name);
        return n.includes(q) || q.includes(n);
      });
      return { item, score: exact ? 100 : partial ? 60 : 0 };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}

function extractTitleFromMessage(message) {
  const normalizedMessage = normalize(message);
  const matches = getTitles()
    .map((item) => {
      const candidates = [item.title, ...(item.aliases || [])];
      const hit = candidates.find((candidate) => normalizedMessage.includes(normalize(candidate)));
      return hit ? { item, length: normalize(hit).length } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  return matches[0]?.item || null;
}

function findFaqAnswer(message) {
  const value = String(message || '').toLowerCase();
  return getFaq().find((faq) => (faq.keywords || []).some((keyword) => value.includes(keyword))) || null;
}

module.exports = {
  getTitles,
  getPlans,
  getFaq,
  searchTitles,
  extractTitleFromMessage,
  findFaqAnswer,
};
