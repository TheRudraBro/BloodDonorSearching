import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const DonorRewardsModal = ({ isOpen, onClose, user }) => {
  const [donationCount, setDonationCount] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid && db) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().donationCount) {
            setDonationCount(userDoc.data().donationCount);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    if (isOpen) fetchUserData();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const getBadgeDetails = (count) => {
    if (count >= 5) {
      return {
        title: "Golden Guardian",
        tier: "Gold Tier",
        icon: "🏆",
        color: "from-amber-400 via-yellow-500 to-amber-600",
        quote: "Legendary Lifesaver of Humanity!"
      };
    } else if (count >= 3) {
      return {
        title: "Silver Hero",
        tier: "Silver Tier",
        icon: "🎖️",
        color: "from-slate-300 via-slate-400 to-slate-500",
        quote: "Dedicated Life Rescuer!"
      };
    } else {
      return {
        title: "Bronze Lifesaver",
        tier: "Bronze Tier",
        icon: "🥉",
        color: "from-amber-700 via-amber-800 to-orange-900",
        quote: "Inspiring Beginning of Saving Lives!"
      };
    }
  };

  const currentBadge = getBadgeDetails(donationCount);

  const handleIncrementDonation = async () => {
    const newCount = donationCount + 1;
    setDonationCount(newCount);
    if (user?.uid && db) {
      await updateDoc(doc(db, "users", user.uid), { donationCount: newCount });
    }
  };

  // 🌟 ULTRA-PREMIUM CERTIFICATE OF APPRECIATION PDF ENGINE 🌟
  const handleGenerateCertificate = () => {
    setLoading(true);
    try {
      const docPdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const donorName = user.displayName || 'Distinguished Donor';
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // 1. Deep Midnight Slate Background
      docPdf.setFillColor(11, 15, 25);
      docPdf.rect(0, 0, 297, 210, 'F');

      // 2. Outer Royal Red Border
      docPdf.setDrawColor(220, 38, 38);
      docPdf.setLineWidth(3);
      docPdf.rect(8, 8, 281, 194);

      // 3. Inner Double Luxury Gold Border
      docPdf.setDrawColor(212, 175, 55);
      docPdf.setLineWidth(1.2);
      docPdf.rect(12, 12, 273, 186);

      docPdf.setDrawColor(212, 175, 55);
      docPdf.setLineWidth(0.4);
      docPdf.rect(14, 14, 269, 182);

      // 4. Background Watermark Crest
      docPdf.setTextColor(25, 30, 45);
      docPdf.setFontSize(85);
      docPdf.setFont('helvetica', 'bold');
      docPdf.text("+", 148.5, 120, { align: 'center' });

      // 5. Header Brand Title
      docPdf.setTextColor(239, 68, 68);
      docPdf.setFont('helvetica', 'bold');
      docPdf.setFontSize(16);
      docPdf.text("EMERGENCY BLOOD FINDER BANGLADESH", 148.5, 30, { align: 'center' });

      // 6. Main Certificate Heading
      docPdf.setTextColor(255, 255, 255);
      docPdf.setFontSize(28);
      docPdf.text("CERTIFICATE OF APPRECIATION", 148.5, 45, { align: 'center' });

      // 7. Sub-Heading
      docPdf.setFontSize(11);
      docPdf.setFont('helvetica', 'normal');
      docPdf.setTextColor(156, 163, 175);
      docPdf.text("THIS OFFICIAL HONOR IS PROUDLY CONFERRED UPON", 148.5, 58, { align: 'center' });

      // 8. 🌟 STYLISH DONOR NAME 🌟
      docPdf.setFontSize(32);
      docPdf.setFont('times', 'bolditalic');
      docPdf.setTextColor(245, 197, 24); // Shimmer Gold
      docPdf.text(donorName, 148.5, 78, { align: 'center' });

      // Decorative Name Underline
      docPdf.setDrawColor(245, 197, 24);
      docPdf.setLineWidth(0.8);
      docPdf.line(70, 83, 227, 83);

      // 9. Appreciation Body Paragraph
      docPdf.setFontSize(11);
      docPdf.setFont('helvetica', 'normal');
      docPdf.setTextColor(229, 231, 235);
      const text = `In sincere and profound recognition of your voluntary humanitarian contribution to saving human lives through selfless blood donation. Awarded the prestigious ${currentBadge.title.toUpperCase()} designation for completing ${donationCount} lifetime registered blood donation milestone(s).`;
      docPdf.text(text, 148.5, 96, { align: 'center', maxWidth: 215, lineHeightFactor: 1.5 });

      // 10. Status Ribbon
      docPdf.setFontSize(13);
      docPdf.setFont('helvetica', 'bold');
      docPdf.setTextColor(239, 68, 68);
      docPdf.text(`★  ${currentBadge.title.toUpperCase()}  |  ${currentBadge.tier.toUpperCase()}  ★`, 148.5, 122, { align: 'center' });

      // 11. 🌟 OFFICIAL BLOODFINDER VERIFIED GOLDEN SEAL (LEFT) 🌟
      docPdf.setFillColor(212, 175, 55); // Gold Seal
      docPdf.circle(65, 155, 15, 'F');
      docPdf.setFillColor(15, 23, 42); // Inner Dark
      docPdf.circle(65, 155, 13, 'F');
      
      docPdf.setTextColor(245, 197, 24);
      docPdf.setFontSize(8);
      docPdf.setFont('helvetica', 'bold');
      docPdf.text("BLOODFINDER", 65, 153, { align: 'center' });
      docPdf.setFontSize(7);
      docPdf.text("OFFICIAL SEAL", 65, 157, { align: 'center' });
      docPdf.text("VERIFIED", 65, 161, { align: 'center' });

      // Date Line Under Seal
      docPdf.setFontSize(9);
      docPdf.setFont('helvetica', 'normal');
      docPdf.setTextColor(156, 163, 175);
      docPdf.text("Issue Date: " + dateStr, 65, 177, { align: 'center' });

      // 12. 🌟 STYLISH SIGNATURE OF RUDRA M. (RIGHT) 🌟
      docPdf.setTextColor(245, 197, 24);
      docPdf.setFont('times', 'bolditalic');
      docPdf.setFontSize(22);
      docPdf.text("Rudra M.", 230, 158, { align: 'center' }); // Script-Style Signature

      docPdf.setDrawColor(100, 116, 139);
      docPdf.setLineWidth(0.6);
      docPdf.line(200, 165, 260, 165);

      docPdf.setFontSize(9);
      docPdf.setFont('helvetica', 'bold');
      docPdf.setTextColor(229, 231, 235);
      docPdf.text("Emergency Blood Finder Authority", 230, 172, { align: 'center' });

      docPdf.setFontSize(7);
      docPdf.setFont('helvetica', 'normal');
      docPdf.setTextColor(156, 163, 175);
      docPdf.text("National Emergency Blood Network", 230, 177, { align: 'center' });

      // Save PDF
      docPdf.save(`Certificate-of-Honor-${donorName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Certificate generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white space-y-5">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold w-8 h-8 flex items-center justify-center rounded-full bg-slate-800"
        >
          ✕
        </button>

        <div className="text-center">
          <span className="text-3xl">{currentBadge.icon}</span>
          <h3 className="text-lg font-black text-white mt-1">Donor Rewards & Milestones</h3>
          <p className="text-xs text-slate-400">Track achievements and download verified certificates</p>
        </div>

        {/* Milestone Honor Card */}
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${currentBadge.color} text-slate-950 text-center font-black shadow-xl space-y-1`}>
          <p className="text-[10px] uppercase tracking-widest text-slate-900/80">Active Milestone Honor</p>
          <h2 className="text-2xl font-black text-white drop-shadow-md">{currentBadge.title}</h2>
          <p className="text-xs text-white/90 font-medium italic">"{currentBadge.quote}"</p>
        </div>

        {/* Donation Count Tracker */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Total Blood Donations:</span>
            <strong className="text-red-400 text-sm font-extrabold">{donationCount} Times</strong>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((donationCount / 5) * 100, 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>🥉 1: Bronze</span>
            <span>🎖️ 3: Silver</span>
            <span>🏆 5+: Gold</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button 
            onClick={handleGenerateCertificate}
            disabled={loading}
            className="btn btn-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-none w-full font-black rounded-xl shadow-lg shadow-amber-950/40 text-xs flex items-center justify-center gap-1.5"
          >
            <span>📜</span> {loading ? 'Generating Luxury PDF...' : 'Download Certificate of Appreciation (PDF)'}
          </button>

          <button 
            onClick={handleIncrementDonation}
            className="btn btn-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 w-full rounded-xl"
          >
            + Record New Blood Donation
          </button>
        </div>

      </div>
    </div>
  );
};

export default DonorRewardsModal;