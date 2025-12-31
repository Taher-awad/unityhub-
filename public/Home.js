document.addEventListener('DOMContentLoaded', () => {
    // Like button functionality
    document.querySelectorAll('.like-btn').forEach(async (btn) => {
        const postElement = btn.closest('.post');
        const postId = postElement.dataset.postId;
        const userId = document.getElementById('user-id').value;

        // Check initial like status
        try {
            const response = await fetch(`/check-like?postId=${postId}&userId=${userId}`);
            const data = await response.json();
            if (response.ok) {
                btn.classList.toggle('liked', data.liked);
            }
        } catch (err) {
            console.error('Error checking like status:', err);
        }

        btn.addEventListener('click', async () => {
            const liked = btn.classList.contains('liked');
            try {
                const response = await fetch('/like', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId, userId, liked })
                });
                const responseData = await response.json();
                if (response.ok) {
                    let likeCount = parseInt(btn.textContent.match(/\d+/)[0]);
                    likeCount = liked ? likeCount - 1 : likeCount + 1;
                    btn.textContent = `Like (${likeCount})`;
                    btn.classList.toggle('liked', responseData.liked);
                } else {
                    alert(responseData.error);
                }
            } catch (err) {
                console.error('Error toggling like:', err);
            }
        });
    });

    // Create Post functionality
    const postBtn = document.getElementById('post-btn');
    if (postBtn) {
        postBtn.addEventListener('click', async () => {
            const text = document.getElementById('post-text').value.trim();
            const userId = document.getElementById('user-id').value;

            if (!text) {
                alert('Please enter some text');
                return;
            }

            try {
                const response = await fetch('/post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, text })
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    const data = await response.json();
                    alert(data.error || 'An error occurred while adding your post');
                }
            } catch (err) {
                console.error('Error creating post:', err);
            }
        });
    }

    // Comment functionality
    const postCommentButtons = document.querySelectorAll('.post-comment-btn');
    postCommentButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const postElement = button.closest('.post');
            const postId = postElement.dataset.postId;
            const commentTextarea = postElement.querySelector('.comment-textarea');
            const commentText = commentTextarea.value.trim();

            if (!commentText) {
                alert('Please enter your comment.');
                return;
            }

            try {
                const response = await fetch('/comment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId, commentText })
                });

                if (response.ok) {
                    commentTextarea.value = '';
                    const newCommentData = await response.json();
                    const newCommentHTML = `
                        <div class="comment">
                            <p>${newCommentData.comment.username}: ${newCommentData.comment.text}</p>
                        </div>
                    `;
                    const commentContainer = postElement.querySelector('.post-comments');
                    commentContainer.insertAdjacentHTML('beforeend', newCommentHTML);
                    
                    // Remove "No comments" message if it exists
                    const noCommentsMsg = postElement.querySelector('.no-comments');
                    if (noCommentsMsg) noCommentsMsg.remove();
                } else {
                    const data = await response.json();
                    alert(data.error || 'An error occurred while adding your comment.');
                }
            } catch (err) {
                console.error('Error posting comment:', err);
            }
        });
    });

    // Load initial comments
    const posts = document.querySelectorAll('.post');
    posts.forEach(async (post) => {
        const postId = post.dataset.postId;
        try {
            const response = await fetch(`/comments?postId=${postId}`);
            const comments = await response.json();
            const commentContainer = post.querySelector('.post-comments');
            commentContainer.innerHTML = ''; // Clear loading/static content
            if (comments.length === 0) {
                commentContainer.innerHTML = '<p class="no-comments">No comments available.</p>';
            } else {
                comments.forEach(comment => {
                    const commentHTML = `
                        <div class="comment">
                            <p>${comment.username}: ${comment.text}</p>
                        </div>
                    `;
                    commentContainer.insertAdjacentHTML('beforeend', commentHTML);
                });
            }
        } catch (err) {
            console.error('Error loading comments:', err);
        }
    });
});
