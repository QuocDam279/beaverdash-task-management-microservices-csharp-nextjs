using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTaskAndAddSubTask : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_comments_tasks_task_id",
                table: "comments");

            migrationBuilder.DropForeignKey(
                name: "FK_tasks_tasks_parent_task_id",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "IX_tasks_parent_task_id",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "parent_task_id",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "task_type",
                table: "tasks");

            migrationBuilder.RenameColumn(
                name: "task_id",
                table: "comments",
                newName: "sub_task_id");

            migrationBuilder.RenameIndex(
                name: "IX_comments_task_id",
                table: "comments",
                newName: "IX_comments_sub_task_id");

            migrationBuilder.AlterColumn<double>(
                name: "sort_order",
                table: "tasks",
                type: "double precision",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "completed_at",
                table: "tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "deleted_at",
                table: "tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "sub_tasks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assignee_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    title = table.Column<string>(type: "varchar", nullable: false),
                    is_completed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                        principalTable: "tasks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_sub_tasks_users_assignee_user_id",
                        column: x => x.assignee_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_sub_tasks_assignee_user_id",
                table: "sub_tasks",
                column: "assignee_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_sub_tasks_task_id",
                table: "sub_tasks",
                column: "task_id");

            migrationBuilder.AddForeignKey(
                name: "FK_comments_sub_tasks_sub_task_id",
                table: "comments",
                column: "sub_task_id",
                principalTable: "sub_tasks",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_comments_sub_tasks_sub_task_id",
                table: "comments");

            migrationBuilder.DropTable(
                name: "sub_tasks");

            migrationBuilder.DropColumn(
                name: "completed_at",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "tasks");

            migrationBuilder.RenameColumn(
                name: "sub_task_id",
                table: "comments",
                newName: "task_id");

            migrationBuilder.RenameIndex(
                name: "IX_comments_sub_task_id",
                table: "comments",
                newName: "IX_comments_task_id");

            migrationBuilder.AlterColumn<int>(
                name: "sort_order",
                table: "tasks",
                type: "integer",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double precision",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "parent_task_id",
                table: "tasks",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "task_type",
                table: "tasks",
                type: "varchar",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tasks_parent_task_id",
                table: "tasks",
                column: "parent_task_id");

            migrationBuilder.AddForeignKey(
                name: "FK_comments_tasks_task_id",
                table: "comments",
                column: "task_id",
                principalTable: "tasks",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_tasks_parent_task_id",
                table: "tasks",
                column: "parent_task_id",
                principalTable: "tasks",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
