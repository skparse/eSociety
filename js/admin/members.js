/**
 * Members Management JavaScript
 */

let usersData = [];
let flatsData = [];
let filteredMembers = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!auth.requireAuth('admin')) {
        return;
    }

    // Update user info in sidebar
    const user = auth.getCurrentUser();
    if (user) {
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-avatar').textContent = Utils.getInitials(user.name);
    }

    // Display society name
    const societyName = auth.getSocietyName();
    if (societyName) {
        document.getElementById('society-name').textContent = societyName;
    }

    // Load data
    await loadData();

    // Check for action parameter
    const params = Utils.getUrlParams();
    if (params.action === 'add') {
        openMemberModal();
    }
});

async function loadData() {
    Utils.showLoading('Loading members...');

    try {
        [usersData, flatsData] = await Promise.all([
            storage.getUsers(),
            storage.getFlats()
        ]);

        // Populate flat dropdown
        populateFlatDropdown();

        // Render table
        filterMembers();

    } catch (error) {
        console.error('Error loading data:', error);
        Utils.showToast('Error loading data', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function populateFlatDropdown() {
    const flatSelect = document.getElementById('member-flat-select');

    // Get flats that are not already linked to other members
    const linkedFlatIds = usersData
        .filter(u => u.flatId && u.isActive)
        .map(u => u.flatId);

    flatSelect.innerHTML = '<option value="">No flat linked</option>' +
        flatsData
            .filter(f => f.isActive !== false)
            .map(f => {
                const isLinked = linkedFlatIds.includes(f.id);
                return `<option value="${f.id}" ${isLinked ? 'disabled' : ''}>
                    ${Utils.escapeHtml(f.flatNo)} - ${Utils.escapeHtml(f.ownerName || 'N/A')}
                    ${isLinked ? ' (linked)' : ''}
                </option>`;
            })
            .join('');
}

function filterMembers() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const roleFilter = document.getElementById('filter-role').value;
    const statusFilter = document.getElementById('filter-status').value;

    filteredMembers = usersData.filter(user => {
        // Search filter
        const matchesSearch = !searchTerm ||
            user.name.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm) ||
            (user.email && user.email.toLowerCase().includes(searchTerm)) ||
            (user.phone && user.phone.includes(searchTerm));

        // Role filter
        const matchesRole = !roleFilter || user.role === roleFilter;

        // Status filter
        const matchesStatus = !statusFilter ||
            (statusFilter === 'active' && user.isActive) ||
            (statusFilter === 'inactive' && !user.isActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    renderMembersTable();
}

function renderMembersTable() {
    const tbody = document.getElementById('members-table-body');
    const currentUser = auth.getCurrentUser();

    if (filteredMembers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted" style="padding: 2rem;">
                    ${usersData.length === 0 ? 'No members added yet. Click "Add Member" to get started.' : 'No members match your search criteria.'}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredMembers.map(user => {
        const flat = user.flatId ? flatsData.find(f => f.id === user.flatId) : null;
        const isCurrentUser = currentUser && currentUser.id === user.id;

        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="sidebar-user-avatar" style="width: 32px; height: 32px; font-size: 12px;">
                            ${Utils.getInitials(user.name)}
                        </div>
                        <strong>${Utils.escapeHtml(user.name)}</strong>
                    </div>
                </td>
                <td>${Utils.escapeHtml(user.username)}</td>
                <td>${user.email || '-'}</td>
                <td>${user.phone || '-'}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}">
                        ${user.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                </td>
                <td>${flat ? Utils.escapeHtml(flat.flatNo) : '-'}</td>
                <td>
                    <span class="badge ${user.isActive ? 'badge-success' : 'badge-danger'}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="editMember('${user.id}')">Edit</button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="openResetPasswordModal('${user.id}')">Reset Password</button>
                    ${!isCurrentUser ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteMember('${user.id}')">Delete</button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function openMemberModal(member = null) {
    const form = document.getElementById('member-form');
    form.reset();

    // Refresh flat dropdown to show current availability
    populateFlatDropdown();

    if (member) {
        document.getElementById('member-modal-title').textContent = 'Edit Member';
        form.id.value = member.id;
        form.username.value = member.username;
        form.password.value = ''; // Don't show password
        form.password.required = false;
        form.role.value = member.role;
        form.flatId.value = member.flatId || '';
        form.name.value = member.name;
        form.phone.value = member.phone || '';
        form.email.value = member.email || '';
        form.isActive.checked = member.isActive;

        // Re-enable the current user's flat in dropdown if editing
        if (member.flatId) {
            const option = form.flatId.querySelector(`option[value="${member.flatId}"]`);
            if (option) {
                option.disabled = false;
            }
        }
    } else {
        document.getElementById('member-modal-title').textContent = 'Add Member';
        form.id.value = '';
        form.password.required = true;
        form.isActive.checked = true;
    }

    Utils.openModal('member-modal');
}

function editMember(id) {
    const member = usersData.find(u => u.id === id);
    if (member) {
        openMemberModal(member);
    }
}

async function saveMember() {
    const form = document.getElementById('member-form');
    const id = form.id.value;

    // Validate
    if (!form.username.value.trim()) {
        Utils.showToast('Please enter username', 'error');
        return;
    }
    if (!id && !form.password.value) {
        Utils.showToast('Please enter password', 'error');
        return;
    }
    if (!form.name.value.trim()) {
        Utils.showToast('Please enter name', 'error');
        return;
    }

    // Check for duplicate username
    const duplicate = usersData.find(u =>
        u.id !== id &&
        u.username.toLowerCase() === form.username.value.trim().toLowerCase()
    );

    if (duplicate) {
        Utils.showToast('Username already exists', 'error');
        return;
    }

    Utils.showLoading('Saving...');

    try {
        if (id) {
            // Update existing
            const index = usersData.findIndex(u => u.id === id);
            if (index !== -1) {
                usersData[index].username = form.username.value.trim();
                usersData[index].role = form.role.value;
                usersData[index].flatId = form.flatId.value || null;
                usersData[index].name = form.name.value.trim();
                usersData[index].phone = form.phone.value.trim();
                usersData[index].email = form.email.value.trim();
                usersData[index].isActive = form.isActive.checked;
                usersData[index].updatedAt = new Date().toISOString();

                // Update password if provided
                if (form.password.value) {
                    usersData[index].password = await Utils.hashPassword(form.password.value);
                }
            }
        } else {
            // Add new
            const newMember = {
                id: Utils.generateId(),
                username: form.username.value.trim(),
                password: await Utils.hashPassword(form.password.value),
                role: form.role.value,
                flatId: form.flatId.value || null,
                name: form.name.value.trim(),
                phone: form.phone.value.trim(),
                email: form.email.value.trim(),
                isActive: form.isActive.checked,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            usersData.push(newMember);
        }

        await storage.saveUsers(usersData);
        filterMembers();
        closeModal('member-modal');
        Utils.showToast('Member saved successfully', 'success');
    } catch (error) {
        console.error('Error saving member:', error);
        Utils.showToast('Error saving member', 'error');
    } finally {
        Utils.hideLoading();
    }
}

async function deleteMember(id) {
    const member = usersData.find(u => u.id === id);
    if (!member) return;

    const currentUser = auth.getCurrentUser();
    if (currentUser && currentUser.id === id) {
        Utils.showToast('You cannot delete your own account', 'error');
        return;
    }

    const confirmed = await Utils.showConfirm(
        `Are you sure you want to deactivate "${member.name}"? They will no longer be able to login.`,
        'Deactivate Member'
    );

    if (!confirmed) return;

    Utils.showLoading('Deleting...');

    try {
        // Soft delete - just deactivate
        const index = usersData.findIndex(u => u.id === id);
        if (index !== -1) {
            usersData[index].isActive = false;
            usersData[index].updatedAt = new Date().toISOString();
        }

        await storage.saveUsers(usersData);
        filterMembers();
        Utils.showToast('Member deactivated successfully', 'success');
    } catch (error) {
        console.error('Error deleting member:', error);
        Utils.showToast('Error deleting member', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function openResetPasswordModal(id) {
    const member = usersData.find(u => u.id === id);
    if (!member) return;

    const form = document.getElementById('reset-password-form');
    form.reset();
    form.userId.value = id;

    document.getElementById('reset-password-user-name').innerHTML =
        `Reset password for <strong>${Utils.escapeHtml(member.name)}</strong> (${Utils.escapeHtml(member.username)})`;

    Utils.openModal('reset-password-modal');
}

async function resetPassword() {
    const form = document.getElementById('reset-password-form');
    const userId = form.userId.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (newPassword.length < 6) {
        Utils.showToast('Password must be at least 6 characters', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        Utils.showToast('Passwords do not match', 'error');
        return;
    }

    Utils.showLoading('Resetting password...');

    try {
        const index = usersData.findIndex(u => u.id === userId);
        if (index !== -1) {
            usersData[index].password = await Utils.hashPassword(newPassword);
            usersData[index].updatedAt = new Date().toISOString();
        }

        await storage.saveUsers(usersData);
        closeModal('reset-password-modal');
        Utils.showToast('Password reset successfully', 'success');
    } catch (error) {
        console.error('Error resetting password:', error);
        Utils.showToast('Error resetting password', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function closeModal(modalId) {
    Utils.closeModal(modalId);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

function handleLogout() {
    auth.logout();
    window.location.href = '../index.html';
}
