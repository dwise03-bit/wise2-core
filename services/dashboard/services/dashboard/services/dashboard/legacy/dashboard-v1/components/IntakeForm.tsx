'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';

export default function IntakeForm() {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
          ? [...(prev[name] || []), value]
          : (prev[name] || []).filter((v: string) => v !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
        ? [...(prev[name] || []), value]
        : (prev[name] || []).filter((v: string) => v !== value)
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, files: e.target.files }));
  };

  return (
    <div style={{ backgroundImage: 'url(/intake-design.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', minHeight: '100vh' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; color: #eef8ff; }
        .page { max-width: 1180px; margin: auto; padding: 28px; }
        .hero { text-align: center; padding: 44px 18px; border: 1px solid rgba(0,174,255,.55); border-radius: 22px; background: linear-gradient(135deg,rgba(0,174,255,.15),rgba(0,0,0,.8)); box-shadow: 0 0 35px rgba(0,174,255,.25); margin-bottom: 24px; }
        .badge { width: 72px; height: 72px; margin: 0 auto 18px; display: grid; place-items: center; border-radius: 50%; border: 1px solid #00aeff; color: #00aeff; box-shadow: 0 0 25px rgba(0,174,255,.7); font-size: 30px; font-weight: 900; }
        h1 { margin: 0; font-size: clamp(32px, 6vw, 72px); letter-spacing: 4px; text-transform: uppercase; }
        .hero p { color: #00aeff; letter-spacing: 3px; text-transform: uppercase; margin: 8px 0; }
        .hero .small { color: #91c8e8; text-transform: none; letter-spacing: 0; margin: 12px 0 0 0; }
        .intake-form { margin-top: 24px; }
        .panel { border: 1px solid rgba(0,174,255,.55); border-radius: 16px; padding: 20px; margin-bottom: 18px; background: rgba(4,18,33,.82); box-shadow: inset 0 0 30px rgba(0,174,255,.08), 0 0 18px rgba(0,174,255,.12); }
        h2 { margin: 0 0 16px; color: #00aeff; text-transform: uppercase; letter-spacing: 2px; font-size: 18px; }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        label { display: block; color: #91c8e8; font-size: 14px; margin-bottom: 8px; }
        input, textarea { width: 100%; margin-top: 7px; padding: 12px; border: 1px solid rgba(0,174,255,.45); border-radius: 10px; background: rgba(0,0,0,.55); color: #eef8ff; outline: none; font-family: inherit; }
        textarea { min-height: 95px; resize: vertical; }
        input:focus, textarea:focus { border-color: #00aeff; box-shadow: 0 0 12px rgba(0,174,255,.35); }
        .checks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .checks label, .agree { padding: 10px; border: 1px solid rgba(0,174,255,.25); border-radius: 10px; background: rgba(0,0,0,.25); cursor: pointer; }
        .checks input, .agree input { width: auto; margin-right: 8px; margin-top: 0; }
        .note { color: #91c8e8; }
        .warning { color: #fff; border-left: 4px solid #00aeff; padding: 10px; background: rgba(0,174,255,.12); }
        .submit { width: 100%; padding: 18px; border: 0; border-radius: 14px; background: linear-gradient(90deg, #007bff, #00aeff); color: #00111d; font-size: 18px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; box-shadow: 0 0 28px rgba(0,174,255,.55); }
        .submit:hover { filter: brightness(1.12); }
        @media (max-width: 760px) { .page { padding: 14px; } .grid, .checks { grid-template-columns: 1fr; } h1 { letter-spacing: 2px; } }
      `}</style>

      <main className="page">
        <section className="hero">
          <div className="badge">W²</div>
          <h1>WISE² Client Information Form</h1>
          <p>One Platform. Infinite Knowledge. Unlimited Creation.</p>
          <p className="small">Fill this out so we can understand your business, your project, and what needs to be built.</p>
        </section>

        <form className="intake-form" action="https://formspree.io/f/YOUR_FORMSPREE_ID" method="POST" encType="multipart/form-data">
          {/* 01 Contact Information */}
          <section className="panel">
            <h2>01 Contact Information</h2>
            <div className="grid">
              <label>Full Name* <input required name="full_name" type="text" onChange={handleChange} /></label>
              <label>Company Name* <input required name="company_name" type="text" onChange={handleChange} /></label>
              <label>Job Title <input name="job_title" type="text" onChange={handleChange} /></label>
              <label>Phone Number* <input required name="phone" type="tel" onChange={handleChange} /></label>
              <label>Email Address* <input required name="email" type="email" onChange={handleChange} /></label>
              <label>Business Address <input name="business_address" type="text" onChange={handleChange} /></label>
              <label>Website <input name="website" type="url" placeholder="https://" onChange={handleChange} /></label>
            </div>
          </section>

          {/* 02 About Your Business */}
          <section className="panel">
            <h2>02 About Your Business</h2>
            <label>Describe your business <textarea name="business_description" onChange={handleChange}></textarea></label>
            <label>What products or services do you offer? <textarea name="products_services" onChange={handleChange}></textarea></label>
            <label>Who is your target audience? <textarea name="target_audience" onChange={handleChange}></textarea></label>
            <label>What makes your business unique? <textarea name="unique_value" onChange={handleChange}></textarea></label>
          </section>

          {/* 03 Services Requested */}
          <section className="panel">
            <h2>03 Services Requested*</h2>
            <div className="checks">
              <label><input type="checkbox" name="services" value="Website Design" onChange={handleCheckboxChange} /> Website Design</label>
              <label><input type="checkbox" name="services" value="Website Redesign" onChange={handleCheckboxChange} /> Website Redesign</label>
              <label><input type="checkbox" name="services" value="E-Commerce Store" onChange={handleCheckboxChange} /> E-Commerce Store</label>
              <label><input type="checkbox" name="services" value="Logo Design" onChange={handleCheckboxChange} /> Logo Design</label>
              <label><input type="checkbox" name="services" value="Branding" onChange={handleCheckboxChange} /> Branding</label>
              <label><input type="checkbox" name="services" value="Graphic Design" onChange={handleCheckboxChange} /> Graphic Design</label>
              <label><input type="checkbox" name="services" value="Social Media Content" onChange={handleCheckboxChange} /> Social Media Content</label>
              <label><input type="checkbox" name="services" value="Photography" onChange={handleCheckboxChange} /> Photography</label>
              <label><input type="checkbox" name="services" value="Video Production" onChange={handleCheckboxChange} /> Video Production</label>
              <label><input type="checkbox" name="services" value="Video Editing" onChange={handleCheckboxChange} /> Video Editing</label>
              <label><input type="checkbox" name="services" value="SEO" onChange={handleCheckboxChange} /> SEO</label>
              <label><input type="checkbox" name="services" value="Google Business Profile" onChange={handleCheckboxChange} /> Google Business Profile</label>
              <label><input type="checkbox" name="services" value="AI Automation" onChange={handleCheckboxChange} /> AI Automation</label>
              <label><input type="checkbox" name="services" value="Marketing Strategy" onChange={handleCheckboxChange} /> Marketing Strategy</label>
              <label><input type="checkbox" name="services" value="Business Consulting" onChange={handleCheckboxChange} /> Business Consulting</label>
              <label><input type="checkbox" name="services" value="Training / Courses" onChange={handleCheckboxChange} /> Training / Courses</label>
            </div>
            <label>Other <input name="other_service" type="text" onChange={handleChange} /></label>
          </section>

          {/* 04 Project Information */}
          <section className="panel">
            <h2>04 Project Information</h2>
            <label>Describe your project* <textarea required name="project_description" onChange={handleChange}></textarea></label>
            <label>What is your primary goal? <textarea name="primary_goal" onChange={handleChange}></textarea></label>
            <label>Examples of what you like <textarea name="examples_like" placeholder="Paste links here" onChange={handleChange}></textarea></label>
            <label>What do you want to avoid? <textarea name="avoid" onChange={handleChange}></textarea></label>
          </section>

          {/* 05 Branding */}
          <section className="panel">
            <h2>05 Branding</h2>
            <div className="checks">
              <label><input type="checkbox" name="current_assets" value="Logo" onChange={handleCheckboxChange} /> Logo</label>
              <label><input type="checkbox" name="current_assets" value="Brand Colors" onChange={handleCheckboxChange} /> Brand Colors</label>
              <label><input type="checkbox" name="current_assets" value="Fonts" onChange={handleCheckboxChange} /> Fonts</label>
              <label><input type="checkbox" name="current_assets" value="Brand Guide" onChange={handleCheckboxChange} /> Brand Guide</label>
              <label><input type="checkbox" name="current_assets" value="Photos" onChange={handleCheckboxChange} /> Photos</label>
              <label><input type="checkbox" name="current_assets" value="Videos" onChange={handleCheckboxChange} /> Videos</label>
              <label><input type="checkbox" name="current_assets" value="None" onChange={handleCheckboxChange} /> None</label>
            </div>
          </section>

          {/* 06 Website Information */}
          <section className="panel">
            <h2>06 Website Information</h2>
            <div className="grid">
              <label>Current Website <input name="current_website" type="url" placeholder="https://" onChange={handleChange} /></label>
              <label>Domain Name <input name="domain_name" type="text" onChange={handleChange} /></label>
              <label>Hosting Company <input name="hosting_company" type="text" onChange={handleChange} /></label>
            </div>
            <div className="checks">
              <label><input type="checkbox" name="website_needs" value="New Website" onChange={handleCheckboxChange} /> New Website</label>
              <label><input type="checkbox" name="website_needs" value="Website Updates" onChange={handleCheckboxChange} /> Website Updates</label>
              <label><input type="checkbox" name="website_needs" value="Online Store" onChange={handleCheckboxChange} /> Online Store</label>
              <label><input type="checkbox" name="website_needs" value="Booking System" onChange={handleCheckboxChange} /> Booking System</label>
              <label><input type="checkbox" name="website_needs" value="Membership Area" onChange={handleCheckboxChange} /> Membership Area</label>
              <label><input type="checkbox" name="website_needs" value="Blog" onChange={handleCheckboxChange} /> Blog</label>
              <label><input type="checkbox" name="website_needs" value="Contact Forms" onChange={handleCheckboxChange} /> Contact Forms</label>
              <label><input type="checkbox" name="website_needs" value="Payment Processing" onChange={handleCheckboxChange} /> Payment Processing</label>
            </div>
          </section>

          {/* 07 Social Media */}
          <section className="panel">
            <h2>07 Social Media</h2>
            <div className="grid">
              <label>Facebook <input name="facebook" type="url" onChange={handleChange} /></label>
              <label>Instagram <input name="instagram" type="url" onChange={handleChange} /></label>
              <label>TikTok <input name="tiktok" type="url" onChange={handleChange} /></label>
              <label>LinkedIn <input name="linkedin" type="url" onChange={handleChange} /></label>
              <label>YouTube <input name="youtube" type="url" onChange={handleChange} /></label>
              <label>Other <input name="other_social" type="text" onChange={handleChange} /></label>
            </div>
          </section>

          {/* 08 Business Assets */}
          <section className="panel">
            <h2>08 Business Assets</h2>
            <p className="note">Upload logos, photos, price lists, service lists, brand guides, or documents.</p>
            <input name="files" type="file" multiple onChange={handleFileChange} />
          </section>

          {/* 09 Login / Access Information */}
          <section className="panel">
            <h2>09 Login / Access Information</h2>
            <p className="warning">Do not enter passwords here. We will send a secure access request separately if needed.</p>
            <div className="grid">
              <label>Domain Registrar <input name="domain_registrar" type="text" onChange={handleChange} /></label>
              <label>Hosting Provider <input name="hosting_provider" type="text" onChange={handleChange} /></label>
              <label>Website Platform <input name="website_platform" type="text" onChange={handleChange} /></label>
              <label>Google Account Email <input name="google_email" type="email" onChange={handleChange} /></label>
              <label>Meta Business Manager <input name="meta_business" type="text" onChange={handleChange} /></label>
              <label>Stripe Account Email <input name="stripe_email" type="email" onChange={handleChange} /></label>
            </div>
            <label>Other Access Needed <textarea name="other_access" onChange={handleChange}></textarea></label>
          </section>

          {/* 10 Timeline & Budget */}
          <section className="panel">
            <h2>10 Timeline & Budget</h2>
            <div className="grid">
              <label>Preferred Start Date <input name="start_date" type="date" onChange={handleChange} /></label>
              <label>Desired Completion Date <input name="completion_date" type="date" onChange={handleChange} /></label>
              <label>Estimated Budget <input name="budget" type="text" placeholder="$" onChange={handleChange} /></label>
            </div>
            <label>Deadline Details <textarea name="deadline_details" onChange={handleChange}></textarea></label>
          </section>

          {/* 11 Preferred Communication */}
          <section className="panel">
            <h2>11 Preferred Communication</h2>
            <div className="checks">
              <label><input type="checkbox" name="communication" value="Phone" onChange={handleCheckboxChange} /> Phone</label>
              <label><input type="checkbox" name="communication" value="Text Message" onChange={handleCheckboxChange} /> Text Message</label>
              <label><input type="checkbox" name="communication" value="Email" onChange={handleCheckboxChange} /> Email</label>
              <label><input type="checkbox" name="communication" value="Zoom / Google Meet" onChange={handleCheckboxChange} /> Zoom / Google Meet</label>
            </div>
          </section>

          {/* 12 Additional Information */}
          <section className="panel">
            <h2>12 Additional Information</h2>
            <label>Anything else we should know? <textarea name="additional_info" onChange={handleChange}></textarea></label>
          </section>

          {/* 13 Client Approval */}
          <section className="panel">
            <h2>13 Client Approval</h2>
            <div className="grid">
              <label>Client Name* <input required name="client_name" type="text" onChange={handleChange} /></label>
              <label>Date* <input required name="approval_date" type="date" onChange={handleChange} /></label>
            </div>
            <label className="agree"><input required type="checkbox" name="agreement" value="Approved" onChange={handleCheckboxChange} /> I certify that the information provided is accurate to the best of my knowledge.</label>
          </section>

          <button className="submit" type="submit">Submit Client Intake</button>
        </form>
      </main>
    </div>
  );
}
