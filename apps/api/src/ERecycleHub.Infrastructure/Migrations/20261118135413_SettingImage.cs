using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERecycleHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SettingImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ImageFileId",
                table: "Settings",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Settings_ImageFileId",
                table: "Settings",
                column: "ImageFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Settings_Files_ImageFileId",
                table: "Settings",
                column: "ImageFileId",
                principalTable: "Files",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Settings_Files_ImageFileId",
                table: "Settings");

            migrationBuilder.DropIndex(
                name: "IX_Settings_ImageFileId",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "ImageFileId",
                table: "Settings");
        }
    }
}
