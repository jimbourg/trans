import { api } from "../api-client";
import { t } from "../i18n/index.js";

interface Tournament {
  id: number;
  name: string;
  description: string;
  maxParticipants: number;
  status: string;
  bracketType: string;
  participantCount: number;
  createdBy: string;
  winner: string | null;
  startDate: string | null;
  createdAt: string;
}

interface MyTournament {
  id: number;
  name: string;
  status: string;
  startDate: string | null;
  placement: number | null;
  participantStatus: string;
}

export async function TournoiView() {
  const wrap = document.createElement("div");
  wrap.className = "max-w-6xl mx-auto mt-8";

  wrap.innerHTML = `
    <h1 class="font-display font-black text-4xl font-bold text-text mb-6">${t('tournament.title')}</h1>

    <div id="tournament-content"></div>
  `;

  const content = wrap.querySelector("#tournament-content") as HTMLDivElement;

  try {
    await api("/auth/me");

    // Fetch tournaments and user's tournaments
    const [tournamentsRes, myTournamentsRes] = await Promise.all([
      api("/tournaments"),
      api("/tournaments/my/list")
    ]);

    const tournaments = await tournamentsRes.json() as Tournament[];
    const myTournaments = await myTournamentsRes.json() as MyTournament[];

    renderAuthenticatedView(content, tournaments, myTournaments);

  } catch (error) {
    content.innerHTML = `
      <div class="bg-prem rounded-lg shadow-xl p-6 text-center">
        <p class="font-sans text-text mb-4">${t('auth.loginRequiredTournaments')}</p>
        <a href="/login" class="inline-block bg-sec hover:bg-opacity-80 text-text font-sans font-bold py-2 px-6 rounded-lg transition">
          ${t('auth.login')}
        </a>
      </div>
    `;
  }

  return wrap;
}

function renderAuthenticatedView(content: HTMLDivElement, tournaments: Tournament[], myTournaments: MyTournament[]) {
  const statusColors = {
    registration: 'bg-blue-600',
    in_progress: 'bg-green-600',
    completed: 'bg-gray-600',
    upcoming: 'bg-yellow-600'
  };

  const statusLabels = {
    registration: 'Open for Registration',
    in_progress: 'In Progress',
    completed: 'Completed',
    upcoming: 'Upcoming'
  };

  content.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-prem rounded-lg shadow-xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-display font-black text-3xl text-text">${t('tournament.availableTournaments')}</h2>
          <button id="create-tournament-btn" class="bg-sec hover:bg-opacity-80 text-text font-sans font-bold py-2 px-4 rounded-lg transition text-sm">
            ➕ ${t('tournament.createTournament')}
          </button>
        </div>
        <div id="tournaments-list" class="space-y-3">
          ${tournaments.length === 0 ? `
            <p class="text-center font-sans text-text/50 py-8">
              ${t('messages.noData')}
            </p>
          ` : tournaments.map(tournament => `
            <div class="p-4 bg-sec rounded-lg hover:bg-opacity-80 transition cursor-pointer tournament-item" data-tournament-id="${tournament.id}">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-display font-bold text-xl text-text">${tournament.name}</h3>
                <span class="px-2 py-1 rounded text-xs text-white ${statusColors[tournament.status as keyof typeof statusColors] || 'bg-gray-600'}">
                  ${statusLabels[tournament.status as keyof typeof statusLabels] || tournament.status}
                </span>
              </div>
              ${tournament.description ? `<p class="font-sans text-text/70 text-sm mb-2">${tournament.description}</p>` : ''}
              <div class="flex justify-between items-center text-sm font-sans text-text/80">
                <span>👥 ${tournament.participantCount}/${tournament.maxParticipants} ${t('tournament.participants')}</span>
                ${tournament.status === 'registration' ? `
                  <button class="join-tournament-btn bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded transition text-xs" data-tournament-id="${tournament.id}">
                    ${t('tournament.joinTournament')}
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="bg-prem rounded-lg shadow-xl p-6">
        <h2 class="font-display font-black text-3xl text-text mb-4">${t('tournament.myTournaments')}</h2>
        <div id="my-tournaments-list" class="space-y-3">
          ${myTournaments.length === 0 ? `
            <p class="text-center font-sans text-text/50 py-8">
              ${t('messages.noData')}
            </p>
          ` : myTournaments.map(tournament => `
            <div class="p-4 bg-sec rounded-lg hover:bg-opacity-80 transition cursor-pointer" data-tournament-id="${tournament.id}">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-display font-bold text-lg text-text">${tournament.name}</h3>
                <span class="px-2 py-1 rounded text-xs text-white ${statusColors[tournament.status as keyof typeof statusColors] || 'bg-gray-600'}">
                  ${statusLabels[tournament.status as keyof typeof statusLabels] || tournament.status}
                </span>
              </div>
              <div class="flex justify-between items-center text-sm font-sans text-text/80">
                <span>Status: ${tournament.participantStatus}</span>
                ${tournament.placement ? `<span>🏆 ${tournament.placement}${getOrdinalSuffix(tournament.placement)} place</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="mt-6 bg-prem rounded-lg shadow-xl p-6">
      <h2 class="font-display font-black text-3xl text-text mb-4">${t('tournament.globalRanking')}</h2>
      <div class="overflow-x-auto">
        <table class="w-full font-sans text-text">
          <thead class="border-b border-sec">
            <tr>
              <th class="py-3 text-left">${t('stats.rank')}</th>
              <th class="py-3 text-left">${t('common.player')}</th>
              <th class="py-3 text-right">${t('stats.gamesWon')}</th>
              <th class="py-3 text-right">${t('stats.points')}</th>
            </tr>
          </thead>
          <tbody id="ranking-tbody">
            <tr class="border-b border-sec/50">
              <td colspan="4" class="py-8 text-center text-text/50">
                Ranking coming soon...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Tournament Modal -->
    <div id="create-tournament-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-prem rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 class="font-display font-black text-2xl text-text mb-4">${t('tournament.createTournament')}</h3>
        <form id="create-tournament-form" class="space-y-4">
          <div>
            <label class="block font-sans text-text mb-2">${t('tournament.tournamentName')}</label>
            <input type="text" id="tournament-name" class="w-full px-3 py-2 bg-sec text-text rounded-lg" required minlength="3" maxlength="100">
          </div>
          <div>
            <label class="block font-sans text-text mb-2">Description</label>
            <textarea id="tournament-description" class="w-full px-3 py-2 bg-sec text-text rounded-lg" maxlength="500" rows="3"></textarea>
          </div>
          <div>
            <label class="block font-sans text-text mb-2">Max ${t('tournament.participants')}</label>
            <select id="tournament-max-participants" class="w-full px-3 py-2 bg-sec text-text rounded-lg">
              <option value="4">4</option>
              <option value="8" selected>8</option>
              <option value="16">16</option>
              <option value="32">32</option>
            </select>
          </div>
          <div class="flex gap-3">
            <button type="button" id="cancel-create-btn" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition">
              ${t('common.cancel')}
            </button>
            <button type="submit" class="flex-1 bg-sec hover:bg-opacity-80 text-text font-bold py-2 px-4 rounded-lg transition">
              ${t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Event listeners
  const createBtn = content.querySelector("#create-tournament-btn") as HTMLButtonElement;
  const modal = content.querySelector("#create-tournament-modal") as HTMLDivElement;
  const cancelBtn = content.querySelector("#cancel-create-btn") as HTMLButtonElement;
  const createForm = content.querySelector("#create-tournament-form") as HTMLFormElement;

  createBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    createForm.reset();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      createForm.reset();
    }
  });

  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (content.querySelector("#tournament-name") as HTMLInputElement).value;
    const description = (content.querySelector("#tournament-description") as HTMLTextAreaElement).value;
    const maxParticipants = parseInt((content.querySelector("#tournament-max-participants") as HTMLSelectElement).value);

    try {
      const response = await api("/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, maxParticipants })
      });

      if (response.ok) {
        modal.classList.add("hidden");
        createForm.reset();
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create tournament");
      }
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert("Failed to create tournament");
    }
  });

  // Join tournament buttons
  content.querySelectorAll(".join-tournament-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const tournamentId = (btn as HTMLElement).dataset.tournamentId;

      try {
        const response = await api(`/tournaments/${tournamentId}/join`, {
          method: "POST"
        });

        if (response.ok) {
          alert("Successfully joined tournament!");
          window.location.reload();
        } else {
          const error = await response.json();
          alert(error.error || "Failed to join tournament");
        }
      } catch (error) {
        console.error("Error joining tournament:", error);
        alert("Failed to join tournament");
      }
    });
  });

  // Tournament item clicks
  content.querySelectorAll(".tournament-item").forEach(item => {
    item.addEventListener("click", (e) => {
      const tournamentId = (item as HTMLElement).dataset.tournamentId;
      window.location.href = `/tournaments/${tournamentId}`;
    });
  });
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}
