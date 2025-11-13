import React from 'react';

interface CampaignIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CampaignIntroModal: React.FC<CampaignIntroModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-900 border-2 border-green-600 w-full max-w-4xl max-h-[90vh] shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 bg-green-900/20 border-b-2 border-green-600 p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl text-green-400">📋</span>
            <h2 className="text-xl font-mono font-bold text-green-400 uppercase tracking-wider">
              Campaign Brief: Pacific Theater 2030
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-6 font-mono text-gray-300">
            {/* Section 1 */}
            <div className="bg-black/40 border border-gray-800 p-4">
              <h3 className="text-green-400 uppercase tracking-wider font-bold mb-3 text-sm">
                The Waning American Presence
              </h3>
              <p className="text-sm leading-relaxed">
                Over the past decade, the strategic balance in the Pacific has steadily deteriorated.
                Following a series of trade frictions, reciprocal sanctions, and mounting geopolitical
                fatigue, the United States initiated a deliberate regional drawdown. The domestic
                consensus in Washington—worn down by two decades of distant wars and persistent economic
                and social strains—shifted toward restraint and internal consolidation. The bases in
                Guam and Okinawa substantially reduced their personnel, while alliances with minor
                partners in Southeast Asia faltered amid perceptions of an increasingly hesitant American
                commitment. The Seventh Fleet, once the symbol of U.S. maritime dominance, now operates
                with limited resources, aging vessels, and a logistical network inadequate for sustained
                operations.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-black/40 border border-gray-800 p-4">
              <h3 className="text-green-400 uppercase tracking-wider font-bold mb-3 text-sm">
                A Faltering Chinese Rise
              </h3>
              <p className="text-sm leading-relaxed">
                Across the Pacific, China confronts its own storm. The debt-fueled, construction-heavy
                growth model that propelled its ascent for fifty years has begun to collapse under
                structural inefficiencies and demographic pressure. The contraction of the real estate
                market, the decline in domestic consumption, and the partial deindustrialization of the
                technology sector have precipitated a deep economic and social crisis. Public unrest
                simmers beneath the surface, and within the Communist Party, divisions over strategic
                direction have intensified. Despite its ambitious rhetoric, the People's Liberation Army
                faces real constraints: delayed shipbuilding schedules, reduced maintenance capacity, and
                overstretched logistics limit its ability to project and sustain power beyond its coastal
                waters.
              </p>
            </div>

            {/* Section 3 */}
            <div className="bg-black/40 border border-gray-800 p-4">
              <h3 className="text-green-400 uppercase tracking-wider font-bold mb-3 text-sm">
                The Accidental Spark
              </h3>
              <p className="text-sm leading-relaxed">
                The spark does not come from Taiwan but from a seemingly minor incident in the Philippine
                Sea. A collision between an American oceanographic vessel and a Chinese frigate in
                contested waters triggers a rapid, uncontrolled escalation. Neither power is ready for
                confrontation: their command structures are uncoordinated, their forces dispersed, and
                their economies unprepared for open warfare. Diplomatic channels fail within hours, and
                regional commanders react independently, amplifying confusion and risk.
              </p>
            </div>

            {/* Section 4 */}
            <div className="bg-black/40 border border-gray-800 p-4">
              <h3 className="text-green-400 uppercase tracking-wider font-bold mb-3 text-sm">
                A War of Improvisation
              </h3>
              <p className="text-sm leading-relaxed">
                The conflict begins abruptly—without strategic coherence, without complete deployments,
                and with forces caught in a state of partial readiness. The available assets on both
                sides are scarce: fragmented detachments, incomplete arsenals, and fatigued personnel.
                Both nations must improvise under immense pressure while struggling to mobilize their
                larger warfighting capabilities. In this volatile environment, no actor holds firm control
                over the Pacific theater.
              </p>
            </div>

            {/* Section 5 - Campaign Opening */}
            <div className="bg-green-900/20 border-2 border-green-600 p-4">
              <p className="text-sm leading-relaxed text-green-300">
                The campaign opens amid uncertainty. Every decision, every movement, carries the potential
                to redefine the balance of power across the Pacific and beyond—a fragile dawn for a war
                neither side intended but neither can now escape.
              </p>
            </div>

            {/* Mission Notice */}
            <div className="bg-yellow-900/20 border-2 border-yellow-600 p-4 text-center">
              <p className="text-yellow-400 font-bold uppercase tracking-wider text-sm">
                ⚠ All players must assign themselves to operational areas before the campaign can begin ⚠
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Button */}
        <div className="border-t-2 border-green-600 bg-gray-900 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 font-mono text-sm font-bold uppercase tracking-wider bg-green-900/20 border-2 border-green-600 text-green-400 hover:bg-green-800/40 transition-all"
          >
            Continue to Planning Phase
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignIntroModal;
