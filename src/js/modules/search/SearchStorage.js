export class SearchStorage {
  constructor(key, element, handleLink) {
    this.key = key;
    this.handleLink = handleLink;
    this.root = element;
    this.jobs = new Map(JSON.parse(localStorage.getItem(this.key) || "[]"));
    this.pruneOldJobs();
    window.addEventListener("storage", () => {
      this.render();
    });
  }
  add(jobID) {
    if (!this.jobs.has(jobID)) {
      this.jobs.set(jobID, {time: Date.now()});
      this.save();
    }
  }
  remove(jobID) {
    if (this.jobs.has(jobID)) {
      this.jobs.delete(jobID);
      this.save();
    }
  }
  pruneOldJobs(){
    const now = Date.now();
    const okTime = 1000 * 60 * 60 * 24 * 30; // 30 days 
    let hasDeleted = false;
    Array.from(this.jobs.entries()).forEach( ([jobID, {time}]) =>{
      if (time < now - okTime){
        this.jobs.delete(jobID);
        hasDeleted = true;
      }
    });
    if (hasDeleted){
      this.save();
    }
  }
  save() {
    localStorage.setItem(
      this.key,
      JSON.stringify(Array.from(this.jobs.entries()))
    );
  }

  render() {
    if (this.jobs.size === 0) {
      this.root.innerHTML =
        "We can't find any previous search jobs in this browser.";
    } else {
      const jobs = Array.from(this.jobs.keys());
      this.root.innerHTML = `
        <ul>
          ${jobs
            .map(
              (jobID) => `
                <li>
                  <a href="#genome-search-mag-tab?job_id=${jobID}">${jobID}</a>
                  <button 
                    id="remove_${jobID}" 
                    class="button secondary small hollow" 
                    style="padding: 0.2em; margin: 0.2em;"
                  >Remove</button>
                </li>`
            )
            .join("")}
        </ul>
      `;
      for (let jobID of jobs) {
        document
          .querySelector(`a[href='#genome-search-mag-tab?job_id=${jobID}']`)
          .addEventListener("click", () => {
            this.handleLink(jobID);
          });
        document
          .getElementById(`remove_${jobID}`)
          .addEventListener("click", () => {
            this.remove(jobID);
          });
      }
    }
  }
}
