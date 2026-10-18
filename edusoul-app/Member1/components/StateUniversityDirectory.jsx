import { useState } from 'react';
import catalog from '../data/stateUniversities.json';
import { useAdvisorTranslation } from '../data/advisorTranslations';

export default function StateUniversityDirectory() {
  const tr = useAdvisorTranslation();
  const [query, setQuery] = useState('');
  const search = query.trim().toLocaleLowerCase();
  const universities = catalog.universities.filter(uni => [uni.name, tr(uni.name), uni.location, tr(uni.location), ...uni.aliases].some(value => value.toLocaleLowerCase().includes(search)));
  return <section className="space-y-5">
    <div className="res-card rounded-xl p-5">
      <h2 className="text-xl font-semibold text-slate-900">{tr('State university directory')} · {catalog.universities.length}</h2>
      <p className="text-sm text-slate-600 mt-2">{tr('17 UGC universities and 5 other state universities. This directory includes all institutions, regardless of your recommended degree.')}</p>
      <p className="text-xs text-slate-600 mt-2">{tr('Check the specific programme, admission route and campus on the official university website.')}</p>
      <label className="block text-sm font-medium text-slate-700 mt-4">{tr('Search universities or locations')}
        <input type="search" className="block w-full mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2" value={query} onChange={event => setQuery(event.target.value)} />
      </label>
    </div>
    {['ugc', 'other_state'].map(category => <section key={category}>
      <h3 className="text-lg font-semibold text-slate-900 mb-3">{tr(category === 'ugc' ? 'Universities under the UGC' : 'Other state universities')} ({universities.filter(uni => uni.category === category).length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {universities.filter(uni => uni.category === category).map(uni => <article key={uni.name} className="res-card rounded-xl p-5" data-testid="state-university-card">
          <h4 className="font-semibold text-slate-900">{tr(uni.name)}</h4>
          <p className="text-sm text-slate-600 mt-1">{tr(uni.location)}</p>
          {(category === 'other_state' || uni.admission_route === 'institution_specific') && <p className="text-xs text-slate-600 mt-2">{tr('Institution-specific admission route')}</p>}
          <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium text-teal-800">
            <a className="underline" href={uni.website} target="_blank" rel="noopener noreferrer">{tr('Official website')} ↗</a>
            <a className="underline" href={`https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: `${uni.name}, ${uni.location}, Sri Lanka` })}`} target="_blank" rel="noopener noreferrer">{tr('Find campus')} ↗</a>
          </div>
        </article>)}
      </div>
    </section>)}
    {universities.length === 0 && <p className="text-sm text-slate-600">{tr('No universities match your search.')}</p>}
    <p className="text-xs text-slate-600">{tr('Directory sources')}: <a className="underline" href={catalog.sources[0]} target="_blank" rel="noopener noreferrer">{tr('Higher Education Ministry')}</a> · <a className="underline" href={catalog.sources[1]} target="_blank" rel="noopener noreferrer">UGC</a></p>
  </section>;
}
