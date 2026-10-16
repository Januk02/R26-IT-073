import { useAdvisorTranslation } from '../data/advisorTranslations';
import React from "react";

export default function DreamHomeCareers({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  displayJobs,
  selectedJob,
  setSelectedJob,
  onStart,
  t,
}) {
  const tr = useAdvisorTranslation();
  return (
    <section
      className="careers-section scroll-reveal"
      id="careers"
    >

      <div className="section-heading">

        <span className="section-label">{tr("EXPLORE YOUR POSSIBILITIES")}</span>

        <h2>{tr("Find a future goal that")}<span>{tr("fits you.")}</span>
        </h2>

        <p>{tr("Explore future goals and discover where your skills, interests and ambitions can take you.")}</p>

      </div>

      {/* Search and Filter Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        {/* Category Filter */}
        <div className="filter-buttons">
          {tr(categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
            >
              {tr(category)}
            </button>
          )))}
        </div>
      </div>

      {/* Job Description Modal */}
      {tr(selectedJob && (
        <div className="job-modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="job-modal" onClick={(e) => e.stopPropagation()}>
            <div className="job-modal-header">
              <div className="job-modal-title">
                <span className="job-modal-icon">{tr(selectedJob.icon)}</span>
                <div>
                  <h3 className="job-modal-name">{tr(selectedJob.title)}</h3>
                  <span className="job-modal-category">{tr(selectedJob.category)}</span>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="job-modal-close">×</button>
            </div>

            <p className="job-modal-description">{tr(selectedJob.description)}</p>

            <div className="job-modal-stats">
              <div className="job-modal-stat job-modal-stat-blue">
                <p className="job-modal-stat-label">{tr("Market Demand")}</p>
                <p className="job-modal-stat-value">{tr(selectedJob.marketDemand)}%</p>
              </div>
              <div className="job-modal-stat job-modal-stat-green">
                <p className="job-modal-stat-label">{tr("Sustainability Score")}</p>
                <p className="job-modal-stat-value">{tr(selectedJob.sustainabilityScore)}%</p>
              </div>
              <div className="job-modal-stat job-modal-stat-purple">
                <p className="job-modal-stat-label">{tr("Average Salary")}</p>
                <p className="job-modal-stat-value">{tr(selectedJob.averageSalary)}</p>
              </div>
            </div>

            <div className="job-modal-section">
              <h4 className="job-modal-section-title">{tr("Required Skills")}</h4>
              <div className="job-modal-tags">
                {tr(selectedJob.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="job-modal-tag job-modal-tag-gray">{tr(skill)}</span>
                )))}
              </div>
            </div>

            <div className="job-modal-section">
              <h4 className="job-modal-section-title">{tr("Required Qualifications")}</h4>
              <div className="job-modal-tags">
                {tr(selectedJob.requiredQualifications.map((qual, idx) => (
                  <span key={idx} className="job-modal-tag job-modal-tag-blue">{tr(qual)}</span>
                )))}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedJob(null);
                onStart();
              }}
              className="job-modal-button"
            >{tr("Start Your Journey with")}{tr(selectedJob.title)}
            </button>
          </div>
        </div>
      ))}

      <div className="career-grid scroll-reveal">

        {tr(displayJobs.map((job) => (
          <div
            className="career-card cursor-pointer"
            key={job.id}
            data-category={job.category}
            onClick={() => setSelectedJob(job)}
          >

            <div className="career-icon">
              {tr(job.icon)}
            </div>

            <span className="category-badge">{tr(job.category)}</span>

            <h3>
              {tr(job.title)}
            </h3>

            <p>{tr("Explore this future goal →")}</p>

            </div>

          )
        ))}

      </div>

    </section>
  );
}
