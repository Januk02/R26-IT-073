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
  return (
    <section
      className="careers-section scroll-reveal"
      id="careers"
    >

      <div className="section-heading">

        <span className="section-label">
          EXPLORE YOUR POSSIBILITIES
        </span>

        <h2>
          Find a future goal that
          <span> fits you.</span>
        </h2>

        <p>
          Explore future goals and discover where your
          skills, interests and ambitions can take you.
        </p>

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
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Job Description Modal */}
      {selectedJob && (
        <div className="job-modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="job-modal" onClick={(e) => e.stopPropagation()}>
            <div className="job-modal-header">
              <div className="job-modal-title">
                <span className="job-modal-icon">{selectedJob.icon}</span>
                <div>
                  <h3 className="job-modal-name">{selectedJob.title}</h3>
                  <span className="job-modal-category">{selectedJob.category}</span>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="job-modal-close">×</button>
            </div>

            <p className="job-modal-description">{selectedJob.description}</p>

            <div className="job-modal-stats">
              <div className="job-modal-stat job-modal-stat-blue">
                <p className="job-modal-stat-label">Market Demand</p>
                <p className="job-modal-stat-value">{selectedJob.marketDemand}%</p>
              </div>
              <div className="job-modal-stat job-modal-stat-green">
                <p className="job-modal-stat-label">Sustainability Score</p>
                <p className="job-modal-stat-value">{selectedJob.sustainabilityScore}%</p>
              </div>
              <div className="job-modal-stat job-modal-stat-purple">
                <p className="job-modal-stat-label">Average Salary</p>
                <p className="job-modal-stat-value">{selectedJob.averageSalary}</p>
              </div>
            </div>

            <div className="job-modal-section">
              <h4 className="job-modal-section-title">Required Skills</h4>
              <div className="job-modal-tags">
                {selectedJob.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="job-modal-tag job-modal-tag-gray">{skill}</span>
                ))}
              </div>
            </div>

            <div className="job-modal-section">
              <h4 className="job-modal-section-title">Required Qualifications</h4>
              <div className="job-modal-tags">
                {selectedJob.requiredQualifications.map((qual, idx) => (
                  <span key={idx} className="job-modal-tag job-modal-tag-blue">{qual}</span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedJob(null);
                onStart();
              }}
              className="job-modal-button"
            >
              Start Your Journey with {selectedJob.title}
            </button>
          </div>
        </div>
      )}

      <div className="career-grid scroll-reveal">

        {displayJobs.map((job) => (
          <div
            className="career-card cursor-pointer"
            key={job.id}
            data-category={job.category}
            onClick={() => setSelectedJob(job)}
          >

            <div className="career-icon">
              {job.icon}
            </div>

            <span className="category-badge">{job.category}</span>

            <h3>
              {job.title}
            </h3>

            <p>
              Explore this future goal →
            </p>

            </div>

          )
        )}

      </div>

    </section>
  );
}
