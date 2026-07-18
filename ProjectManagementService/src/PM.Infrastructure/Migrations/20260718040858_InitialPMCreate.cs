using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialPMCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "pm");

            migrationBuilder.CreateTable(
                name: "outbox_messages",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "varchar(255)", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    occurred_on_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    processed_on_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    error = table.Column<string>(type: "text", nullable: true),
                    retry_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_outbox_messages", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "varchar", nullable: false),
                    display_name = table.Column<string>(type: "varchar", nullable: false),
                    avatar = table.Column<string>(type: "varchar", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notification_trackings",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    notification_type = table.Column<string>(type: "varchar", nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity_type = table.Column<string>(type: "varchar", nullable: false),
                    days_remaining_or_overdue = table.Column<int>(type: "integer", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sent_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_trackings", x => x.id);
                    table.ForeignKey(
                        name: "FK_notification_trackings_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "varchar", nullable: true),
                    content = table.Column<string>(type: "text", nullable: true),
                    action_url = table.Column<string>(type: "varchar", nullable: true),
                    is_read = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_sent_via_email = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    email_sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notifications", x => x.id);
                    table.ForeignKey(
                        name: "FK_notifications_users_actor_user_id",
                        column: x => x.actor_user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_notifications_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "teams",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "varchar", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    owner_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_teams", x => x.id);
                    table.ForeignKey(
                        name: "FK_teams_users_owner_user_id",
                        column: x => x.owner_user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "projects",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    team_id = table.Column<Guid>(type: "uuid", nullable: true),
                    name = table.Column<string>(type: "varchar", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    progress = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_public = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    share_token = table.Column<string>(type: "varchar", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_projects", x => x.id);
                    table.ForeignKey(
                        name: "FK_projects_teams_team_id",
                        column: x => x.team_id,
                        principalSchema: "pm",
                        principalTable: "teams",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_projects_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "team_members",
                schema: "pm",
                columns: table => new
                {
                    team_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "varchar", nullable: false),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_team_members", x => new { x.team_id, x.user_id });
                    table.ForeignKey(
                        name: "FK_team_members_teams_team_id",
                        column: x => x.team_id,
                        principalSchema: "pm",
                        principalTable: "teams",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_team_members_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "activity_log",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    project_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity_type = table.Column<string>(type: "varchar", nullable: true),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    action_type = table.Column<string>(type: "varchar", nullable: true),
                    old_value = table.Column<string>(type: "jsonb", nullable: true),
                    new_value = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activity_log", x => x.id);
                    table.ForeignKey(
                        name: "FK_activity_log_projects_project_id",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_activity_log_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "board_columns",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    project_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "varchar", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    wip_limit = table.Column<int>(type: "integer", nullable: true),
                    is_done = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_board_columns", x => x.id);
                    table.ForeignKey(
                        name: "FK_board_columns_projects_project_id",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "chat_messages",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_id = table.Column<Guid>(type: "uuid", nullable: false),
                    project_id = table.Column<Guid>(type: "uuid", nullable: true),
                    team_id = table.Column<Guid>(type: "uuid", nullable: true),
                    content = table.Column<string>(type: "text", nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: true),
                    file_name = table.Column<string>(type: "text", nullable: true),
                    file_type = table.Column<string>(type: "text", nullable: true),
                    file_size = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_messages", x => x.id);
                    table.ForeignKey(
                        name: "FK_chat_messages_projects_project_id",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_chat_messages_teams_team_id",
                        column: x => x.team_id,
                        principalSchema: "pm",
                        principalTable: "teams",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_chat_messages_users_sender_id",
                        column: x => x.sender_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "project_documents",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    project_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "varchar", nullable: false),
                    file_url = table.Column<string>(type: "varchar", nullable: false),
                    file_type = table.Column<string>(type: "varchar", nullable: true),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: true),
                    uploaded_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_project_documents", x => x.id);
                    table.ForeignKey(
                        name: "FK_project_documents_projects_project_id",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_project_documents_users_uploaded_by_user_id",
                        column: x => x.uploaded_by_user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "project_shares",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    project_id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient_email = table.Column<string>(type: "varchar", nullable: false),
                    shared_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_project_shares", x => x.id);
                    table.ForeignKey(
                        name: "FK_project_shares_projects_project_id",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_project_shares_users_shared_by_user_id",
                        column: x => x.shared_by_user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sprints",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    project_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "varchar", nullable: false),
                    goal = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "varchar", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sprints", x => x.id);
                    table.ForeignKey(
                        name: "FK_sprints_projects_project_id",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tasks",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    board_column_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sprint_id = table.Column<Guid>(type: "uuid", nullable: true),
                    title = table.Column<string>(type: "varchar", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    priority = table.Column<string>(type: "varchar", nullable: true),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    sort_order = table.Column<double>(type: "double precision", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tasks", x => x.id);
                    table.ForeignKey(
                        name: "FK_tasks_board_columns_board_column_id",
                        column: x => x.board_column_id,
                        principalSchema: "pm",
                        principalTable: "board_columns",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tasks_sprints_sprint_id",
                        column: x => x.sprint_id,
                        principalSchema: "pm",
                        principalTable: "sprints",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_tasks_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sub_tasks",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assignee_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    title = table.Column<string>(type: "varchar", nullable: false),
                    is_completed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    priority = table.Column<string>(type: "varchar", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sub_tasks", x => x.id);
                    table.ForeignKey(
                        name: "FK_sub_tasks_tasks_task_id",
                        column: x => x.task_id,
                        principalSchema: "pm",
                        principalTable: "tasks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_sub_tasks_users_assignee_user_id",
                        column: x => x.assignee_user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "comments",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sub_task_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_comments", x => x.id);
                    table.ForeignKey(
                        name: "FK_comments_sub_tasks_sub_task_id",
                        column: x => x.sub_task_id,
                        principalSchema: "pm",
                        principalTable: "sub_tasks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_comments_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "pm",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "attachments",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    comment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "varchar", nullable: false),
                    file_url = table.Column<string>(type: "varchar", nullable: false),
                    file_type = table.Column<string>(type: "varchar", nullable: true),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_attachments", x => x.id);
                    table.ForeignKey(
                        name: "FK_attachments_comments_comment_id",
                        column: x => x.comment_id,
                        principalSchema: "pm",
                        principalTable: "comments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_activity_log_project_id_created_at",
                schema: "pm",
                table: "activity_log",
                columns: new[] { "project_id", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_activity_log_user_id",
                schema: "pm",
                table: "activity_log",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_attachments_comment_id",
                schema: "pm",
                table: "attachments",
                column: "comment_id");

            migrationBuilder.CreateIndex(
                name: "ix_board_columns_project_id_position",
                schema: "pm",
                table: "board_columns",
                columns: new[] { "project_id", "position" });

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_project_id_created_at",
                schema: "pm",
                table: "chat_messages",
                columns: new[] { "project_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_sender_id",
                schema: "pm",
                table: "chat_messages",
                column: "sender_id");

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_team_id_created_at",
                schema: "pm",
                table: "chat_messages",
                columns: new[] { "team_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_comments_sub_task_id",
                schema: "pm",
                table: "comments",
                column: "sub_task_id");

            migrationBuilder.CreateIndex(
                name: "IX_comments_user_id",
                schema: "pm",
                table: "comments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_notification_trackings_lookup",
                schema: "pm",
                table: "notification_trackings",
                columns: new[] { "entity_id", "notification_type", "days_remaining_or_overdue", "user_id" });

            migrationBuilder.CreateIndex(
                name: "IX_notification_trackings_user_id",
                schema: "pm",
                table: "notification_trackings",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_actor_user_id",
                schema: "pm",
                table: "notifications",
                column: "actor_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_id_created_at",
                schema: "pm",
                table: "notifications",
                columns: new[] { "user_id", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "ix_outbox_messages_unprocessed",
                schema: "pm",
                table: "outbox_messages",
                column: "processed_on_utc",
                filter: "processed_on_utc IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_project_documents_project_id",
                schema: "pm",
                table: "project_documents",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_project_documents_uploaded_by_user_id",
                schema: "pm",
                table: "project_documents",
                column: "uploaded_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_project_shares_project_id_recipient_email",
                schema: "pm",
                table: "project_shares",
                columns: new[] { "project_id", "recipient_email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_project_shares_recipient_email",
                schema: "pm",
                table: "project_shares",
                column: "recipient_email");

            migrationBuilder.CreateIndex(
                name: "IX_project_shares_shared_by_user_id",
                schema: "pm",
                table: "project_shares",
                column: "shared_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_projects_created_by_user_id",
                schema: "pm",
                table: "projects",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_projects_share_token",
                schema: "pm",
                table: "projects",
                column: "share_token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_projects_team_id",
                schema: "pm",
                table: "projects",
                column: "team_id");

            migrationBuilder.CreateIndex(
                name: "ix_sprints_project_id_status",
                schema: "pm",
                table: "sprints",
                columns: new[] { "project_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_sub_tasks_assignee_user_id",
                schema: "pm",
                table: "sub_tasks",
                column: "assignee_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_sub_tasks_task_id",
                schema: "pm",
                table: "sub_tasks",
                column: "task_id");

            migrationBuilder.CreateIndex(
                name: "ix_tasks_board_column_id_sort_order",
                schema: "pm",
                table: "tasks",
                columns: new[] { "board_column_id", "sort_order" });

            migrationBuilder.CreateIndex(
                name: "IX_tasks_created_by_user_id",
                schema: "pm",
                table: "tasks",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_tasks_sprint_id",
                schema: "pm",
                table: "tasks",
                column: "sprint_id");

            migrationBuilder.CreateIndex(
                name: "IX_team_members_user_id",
                schema: "pm",
                table: "team_members",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_teams_owner_user_id",
                schema: "pm",
                table: "teams",
                column: "owner_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                schema: "pm",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "activity_log",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "attachments",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "chat_messages",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "notification_trackings",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "notifications",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "outbox_messages",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "project_documents",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "project_shares",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "team_members",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "comments",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "sub_tasks",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "tasks",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "board_columns",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "sprints",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "projects",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "teams",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "users",
                schema: "pm");
        }
    }
}
