import { Accessibility, ArrowRight, Clock3, LocateFixed, MapPin, Users } from "lucide-react";
import "../../styles/launch.css";

const photoSource = "https://commons.wikimedia.org/wiki/File:Bryant_Park_Restroom_2023_front.jpg";
const councilStudy = "https://council.nyc.gov/data/public-restroom-analysis/";

const needs = [
  {
    title: "A quick route in an urgent moment",
    icon: Clock3,
    evidence: "The Crohn’s & Colitis Foundation describes how people with inflammatory bowel disease can need a restroom with little warning.",
    response: "Bathroom Finder puts nearby results and directions one tap from the map.",
    source: "Crohn’s & Colitis Foundation",
    url: "https://www.crohnscolitisfoundation.org/patientsandcaregivers/wecantwait",
  },
  {
    title: "Details about physical access",
    icon: Accessibility,
    evidence: "In a qualitative study, disabled people and caregivers described planning outings around whether a restroom could meet their needs, including access to adult-sized changing tables.",
    response: "The app filters for listed wheelchair access and shows changing-station information when the directory provides it.",
    source: "Qualitative study on restroom accessibility",
    url: "https://pubmed.ncbi.nlm.nih.gov/37714764/",
  },
  {
    title: "All-gender options people can find",
    icon: Users,
    evidence: "In a 2021 U.S. online survey of 12,596 transgender and nonbinary young people, about three in four reported avoiding restrooms at least sometimes because they feared problems.",
    response: "The gender-neutral filter makes all-gender facilities easier to find where listings identify them.",
    source: "U.S. study on restroom avoidance",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12016251/",
  },
];

export function LaunchPage({ online, offlineReady }: { online: boolean; offlineReady: boolean }) {
  return (
    <div className="launch-page" id="about">
      <header className="launch-header">
        <nav className="launch-width launch-nav" aria-label="Bathroom Finder">
          <a className="launch-brand" href="#about"><MapPin size={21} aria-hidden="true" /> Bathroom Finder</a>
          <a className="launch-nav-link" href="#research">Research</a>
        </nav>
      </header>

      <main>
        <section className="launch-hero" aria-labelledby="launch-title">
          <div className="launch-width launch-hero-layout">
            <div className="launch-intro">
              <h1 id="launch-title">Bathroom Finder</h1>
              <p className="launch-lead">Find nearby restrooms and check whether they meet your needs before you go.</p>
              <p className="launch-description">Search the map, filter for wheelchair-accessible or gender-neutral restrooms, and get directions. Use your location or browse a different area.</p>
              <div className="launch-actions">
                {online && <a className="launch-action" href="#nearby"><LocateFixed size={19} aria-hidden="true" /> Find near me</a>}
                <a className={`launch-action${online ? " launch-action-secondary" : ""}`} href="#map">{online ? "Open map" : "Open saved map"} <ArrowRight size={19} aria-hidden="true" /></a>
              </div>
              {(!online || offlineReady) && <p className="launch-offline-status" role="status">
                {online ? "Available offline after this visit" : "Offline. Open the map to view saved results and favorites."}
              </p>}
            </div>
            <figure className="launch-photo">
              <img src={import.meta.env.BASE_URL + "bryant-park-restroom.jpg"} width={1280} height={960} alt="Street entrance to the Bryant Park public restroom in Manhattan" />
              <figcaption>Bryant Park public restroom, New York City. <a href={photoSource}>Photo by SnowFire</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</figcaption>
            </figure>
          </div>
        </section>

        <section className="launch-width launch-research" id="research" aria-labelledby="research-title">
          <h2 id="research-title">Why restroom access matters</h2>
          <p className="launch-section-intro">Finding a nearby restroom depends on where it is, when it opens, and who can use it. New York City’s public restroom analysis shows how availability can narrow even in a dense city.</p>
          <dl className="launch-stats">
            <div><dt>of NYC residents live within a five-minute walk of a public restroom</dt><dd>49.4%</dd></div>
            <div><dt>operational NYC public restrooms were listed as available 24/7</dt><dd>8 of 973</dd></div>
          </dl>
          <p className="launch-source"><a href={councilStudy}>NYC Council public restroom analysis (November 2025 data)</a></p>

          <h2 className="launch-needs-title">What people need to know</h2>
          <div className="launch-needs">
            {needs.map(({ title, icon: Icon, evidence, response, source, url }) => (
              <article key={title} className="launch-need">
                <Icon size={24} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{evidence}</p>
                  <p>{response}</p>
                  <a className="launch-source" href={url}>{source}</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="launch-data" aria-labelledby="data-title">
          <div className="launch-width launch-data-layout">
            <div>
              <h2 id="data-title">Where the listings come from</h2>
              <p>The starting map uses NYC’s public restroom directory. Location and area searches use REFUGE Restrooms, a community directory with coverage that varies by area. Hours, access rules, and facilities can change.</p>
              <p className="launch-source"><a href="https://data.cityofnewyork.us/d/i7jb-7jku">NYC Open Data</a> <a href="https://www.refugerestrooms.org/">REFUGE Restrooms</a></p>
            </div>
            <a className="launch-action" href="#map">Open map <ArrowRight size={19} aria-hidden="true" /></a>
          </div>
        </section>
      </main>
    </div>
  );
}
