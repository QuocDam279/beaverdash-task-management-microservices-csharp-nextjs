using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "notification_trackings",
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
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_notification_trackings_lookup",
                table: "notification_trackings",
                columns: new[] { "entity_id", "notification_type", "days_remaining_or_overdue", "user_id" });

            migrationBuilder.CreateIndex(
                name: "IX_notification_trackings_user_id",
                table: "notification_trackings",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notification_trackings");
        }
    }
}
