-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 08, 2025 at 03:51 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `apm_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_periods`
--

CREATE TABLE `academic_periods` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('first_semester','second_semester','summer','academic_year') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_periods`
--

INSERT INTO `academic_periods` (`id`, `name`, `type`, `start_date`, `end_date`, `is_current`, `created_at`, `updated_at`) VALUES
(1, 'الفصل الأول 2023', 'first_semester', '2023-09-01', '2024-01-15', 1, '2025-06-06 07:53:49', '2025-06-06 11:15:35'),
(2, 'الفصل الثاني 2023', 'second_semester', '2024-01-16', '2024-05-16', 0, '2025-06-06 11:12:02', '2025-06-06 11:15:35'),
(3, 'الفصل الصيفي 2023', 'summer', '2024-05-17', '2024-09-16', 0, '2025-06-06 11:12:45', '2025-06-06 11:15:35'),
(4, 'الفصل الصيفي 2023', 'summer', '2024-09-17', '2024-11-20', 0, '2025-06-06 11:13:51', '2025-06-06 11:15:35');

-- --------------------------------------------------------

--
-- Table structure for table `academic_period_project`
--

CREATE TABLE `academic_period_project` (
  `academic_period_id` bigint UNSIGNED NOT NULL,
  `project_projectid` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_period_project`
--

INSERT INTO `academic_period_project` (`academic_period_id`, `project_projectid`) VALUES
(4, 77),
(1, 79),
(2, 79),
(1, 81),
(1, 82),
(2, 82),
(1, 83),
(1, 85),
(2, 85);

-- --------------------------------------------------------

--
-- Table structure for table `alumni`
--

CREATE TABLE `alumni` (
  `alumniId` bigint UNSIGNED NOT NULL,
  `userId` bigint UNSIGNED NOT NULL,
  `graduationYear` year NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `department_heads`
--

CREATE TABLE `department_heads` (
  `headId` bigint UNSIGNED NOT NULL,
  `userId` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_criteria`
--

CREATE TABLE `evaluation_criteria` (
  `criteria_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_criteria`
--

INSERT INTO `evaluation_criteria` (`criteria_id`, `title`, `description`, `created_at`, `updated_at`) VALUES
(1, 'التعاون في الفريق', 'مدى المشاركة الفعالة في أنشطة الفريق', '2025-05-16 12:14:32', '2025-05-16 12:14:32'),
(2, 'الالتزام بالمواعيد', 'التسليم في الوقت المحدد', '2025-05-16 12:14:33', '2025-05-16 12:14:33'),
(3, 'جودة العمل', 'دقة وإتقان المهام المكلف بها', '2025-05-16 12:14:33', '2025-05-16 12:14:33'),
(4, 'المبادرة', 'تقديم أفكار جديدة وتحمل المسؤوليات الإضافية', '2025-05-16 12:14:33', '2025-05-16 12:14:33');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `groupid` bigint UNSIGNED NOT NULL,
  `projectid` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`groupid`, `projectid`, `name`, `created_at`, `updated_at`) VALUES
(1, 2, 'نظام إدارة التخرج', '2025-05-02 12:59:10', '2025-05-02 12:59:10'),
(2, 3, 'نظام إدارة التخرج', '2025-05-02 12:59:31', '2025-05-02 12:59:31'),
(3, 4, 'نظام إدارة التخرج', '2025-05-02 12:59:59', '2025-05-02 12:59:59'),
(4, 5, 'نظام إدارة التخرج', '2025-05-02 13:06:20', '2025-05-02 13:06:20'),
(5, 7, 'نظام إدارة التخرج', '2025-05-02 13:14:18', '2025-05-02 13:14:18'),
(6, 8, 'نظام إدارة التخرج', '2025-05-02 13:20:55', '2025-05-02 13:20:55'),
(7, 9, 'نظام إدارة التخرج', '2025-05-02 14:13:04', '2025-05-02 14:13:04'),
(8, 10, 'نظام إدارة التخرج', '2025-05-02 14:17:57', '2025-05-02 14:17:57'),
(9, 11, 'نظام إدارة التخرج', '2025-05-02 14:20:25', '2025-05-02 14:20:25'),
(10, 12, 'ksfdkfm', '2025-05-03 08:40:36', '2025-05-03 08:40:36'),
(11, 13, 'ksfdkfm', '2025-05-03 08:40:40', '2025-05-03 08:40:40'),
(12, 14, 'ksfdkfm', '2025-05-03 08:40:43', '2025-05-03 08:40:43'),
(13, 15, 'ksfdkfm', '2025-05-03 08:40:44', '2025-05-03 08:40:44'),
(14, 16, 'ksfdkfm', '2025-05-03 08:40:45', '2025-05-03 08:40:45'),
(15, 17, 'ksfdkfm', '2025-05-03 08:40:46', '2025-05-03 08:40:46'),
(16, 18, 'ksfdkfm', '2025-05-03 08:40:46', '2025-05-03 08:40:46'),
(17, 19, 'ksfdkfm', '2025-05-03 08:40:49', '2025-05-03 08:40:49'),
(18, 20, 'ksfdkfm', '2025-05-03 08:40:49', '2025-05-03 08:40:49'),
(19, 21, 'ksfdkfm', '2025-05-03 08:40:51', '2025-05-03 08:40:51'),
(20, 22, 'ksfdkfm', '2025-05-03 08:40:53', '2025-05-03 08:40:53'),
(21, 23, 'ksfdkfm', '2025-05-03 08:40:54', '2025-05-03 08:40:54'),
(22, 24, 'ksfdkfm', '2025-05-03 08:40:55', '2025-05-03 08:40:55'),
(23, 25, 'ksfdkfm', '2025-05-03 08:40:55', '2025-05-03 08:40:55'),
(24, 26, 'ksfdkfm', '2025-05-03 08:41:01', '2025-05-03 08:41:01'),
(25, 27, 'ksfdkfm', '2025-05-03 08:41:02', '2025-05-03 08:41:02'),
(26, 28, 'ksfdkfm', '2025-05-03 08:41:03', '2025-05-03 08:41:03'),
(27, 29, 'ksfdkfm', '2025-05-03 08:41:03', '2025-05-03 08:41:03'),
(28, 30, 'ksfdkfm', '2025-05-03 08:41:04', '2025-05-03 08:41:04'),
(29, 31, 'ksfdkfm', '2025-05-03 08:41:41', '2025-05-03 08:41:41'),
(30, 32, 'ksfdkfm', '2025-05-03 08:43:33', '2025-05-03 08:43:33'),
(31, 33, 'ksfdkfm', '2025-05-03 08:43:35', '2025-05-03 08:43:35'),
(32, 34, 'ksfdkfm', '2025-05-03 08:43:36', '2025-05-03 08:43:36'),
(33, 35, 'ksfdkfm', '2025-05-03 08:43:37', '2025-05-03 08:43:37'),
(34, 36, 'ksfdkfm', '2025-05-03 08:43:38', '2025-05-03 08:43:38'),
(35, 37, 'ksfdkfm', '2025-05-03 08:43:44', '2025-05-03 08:43:44'),
(36, 38, 'ksfdkfm', '2025-05-03 08:43:47', '2025-05-03 08:43:47'),
(37, 39, 'ksfdkfm', '2025-05-03 08:43:48', '2025-05-03 08:43:48'),
(38, 40, 'ksfdkfm', '2025-05-03 08:44:22', '2025-05-03 08:44:22'),
(39, 41, 'ksfdkfm', '2025-05-03 08:44:22', '2025-05-03 08:44:22'),
(40, 42, 'ksfdkfm', '2025-05-03 08:44:23', '2025-05-03 08:44:23'),
(41, 43, 'ksfdkfm', '2025-05-03 09:00:23', '2025-05-03 09:00:23'),
(42, 44, 'ksfdkfm', '2025-05-03 09:01:23', '2025-05-03 09:01:23'),
(43, 45, 'ksfdkfm', '2025-05-03 16:21:38', '2025-05-03 16:21:38'),
(45, 47, 'نظام إدارة المشاريع', '2025-05-07 04:25:33', '2025-05-07 04:25:33'),
(46, 48, 'نظام إدارة التخرج', '2025-05-07 09:00:46', '2025-05-07 09:00:46'),
(47, 49, 'مشروع تخرج جديد', '2025-05-07 11:46:06', '2025-05-07 11:46:06'),
(48, 50, 'مشروع تخرج جديد', '2025-05-07 11:46:30', '2025-05-07 11:46:30'),
(49, 51, 'مشروع تخرج جديد', '2025-05-07 11:46:56', '2025-05-07 11:46:56'),
(50, 52, 'مشروع تخرج جديد', '2025-05-07 12:24:32', '2025-05-07 12:24:32'),
(51, 54, 'مشروع التخرج', '2025-05-07 15:31:42', '2025-05-07 15:31:42'),
(52, 55, 'مشروع تطوير نظام إدارة المهام', '2025-05-07 15:56:20', '2025-05-07 15:56:20'),
(53, 56, 'مشروع الذكاء الاصطناعي', '2025-05-17 06:38:59', '2025-05-17 06:38:59'),
(55, 58, 'مشروع الذكاء الاصطناعي', '2025-05-17 07:20:42', '2025-05-17 07:20:42'),
(58, 61, 'مشروع تجريبي', '2025-05-17 09:27:29', '2025-05-17 09:27:29'),
(59, 62, 'مشروع تجريبي', '2025-05-17 12:07:35', '2025-05-17 12:07:35'),
(60, 63, 'مشروع تجريبي', '2025-05-17 15:36:48', '2025-05-17 15:36:48'),
(61, 64, 'مشروع تجريبي', '2025-05-17 16:27:47', '2025-05-17 16:27:47'),
(62, 65, 'مشروع تجريبي', '2025-05-17 16:28:23', '2025-05-17 16:28:23'),
(63, 66, 'vadm', '2025-06-03 04:46:14', '2025-06-03 04:46:14'),
(64, 67, 'kmadksm', '2025-06-03 05:07:59', '2025-06-03 05:07:59'),
(65, 68, 'مشروع الفصل الدراسي الأول', '2025-06-05 09:06:52', '2025-06-05 09:06:52'),
(73, 77, 'مشروع الفصل الدراسي الأول', '2025-06-07 14:08:13', '2025-06-07 14:08:13'),
(75, 79, 'مشروع الفصل الدراسي الأول', '2025-06-07 14:12:01', '2025-06-07 14:12:01'),
(77, 81, 'يبتىشم', '2025-06-08 00:33:32', '2025-06-08 00:33:32'),
(78, 82, 'ةىشيبمنى', '2025-06-08 00:34:29', '2025-06-08 00:34:29'),
(79, 83, ',nv,mznln', '2025-06-08 00:42:20', '2025-06-08 00:42:20'),
(81, 85, 'lav,m', '2025-06-08 00:44:13', '2025-06-08 00:44:13');

-- --------------------------------------------------------

--
-- Table structure for table `group_student`
--

CREATE TABLE `group_student` (
  `studentId` bigint UNSIGNED NOT NULL,
  `groupid` bigint UNSIGNED NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `is_leader` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `group_student`
--

INSERT INTO `group_student` (`studentId`, `groupid`, `status`, `is_leader`, `created_at`, `updated_at`) VALUES
(2, 53, 'pending', 0, NULL, NULL),
(2, 55, 'pending', 0, NULL, NULL),
(2, 58, 'pending', 0, NULL, NULL),
(2, 59, 'pending', 0, NULL, NULL),
(2, 60, 'pending', 0, NULL, NULL),
(2, 61, 'pending', 0, NULL, NULL),
(2, 62, 'pending', 0, NULL, NULL),
(2, 63, 'pending', 1, NULL, NULL),
(2, 64, 'pending', 1, NULL, NULL),
(2, 65, 'pending', 0, NULL, NULL),
(2, 73, 'pending', 0, NULL, NULL),
(2, 75, 'pending', 0, NULL, NULL),
(2, 79, 'approved', 1, NULL, NULL),
(2, 81, 'approved', 1, NULL, NULL),
(3, 6, 'pending', 0, '2025-05-02 13:20:55', '2025-05-02 13:20:55'),
(3, 7, 'pending', 0, '2025-05-02 14:13:04', '2025-05-02 14:13:04'),
(3, 8, 'pending', 0, '2025-05-02 14:17:57', '2025-05-02 14:17:57'),
(3, 9, 'pending', 0, '2025-05-02 14:20:25', '2025-05-02 14:20:25'),
(3, 47, 'pending', 0, '2025-05-07 11:46:06', '2025-05-07 11:46:06'),
(3, 64, 'pending', 0, NULL, NULL),
(3, 65, 'pending', 0, NULL, NULL),
(3, 73, 'pending', 0, NULL, NULL),
(3, 75, 'pending', 0, NULL, NULL),
(4, 45, 'pending', 0, '2025-05-07 04:25:33', '2025-05-07 04:25:33'),
(4, 51, 'pending', 0, '2025-05-07 15:31:43', '2025-05-07 15:31:43'),
(4, 52, 'approved', 0, NULL, '2025-05-16 12:47:58'),
(4, 58, 'pending', 1, NULL, NULL),
(4, 59, 'pending', 1, NULL, NULL),
(4, 60, 'pending', 1, NULL, NULL),
(4, 61, 'pending', 1, NULL, NULL),
(4, 62, 'approved', 1, NULL, '2025-05-17 18:16:04'),
(4, 79, 'approved', 0, NULL, NULL),
(4, 81, 'approved', 0, NULL, NULL),
(5, 47, 'pending', 0, '2025-05-07 11:46:06', '2025-05-07 11:46:06'),
(5, 77, 'approved', 0, NULL, NULL),
(6, 78, 'approved', 0, NULL, NULL),
(83, 63, 'pending', 0, NULL, NULL),
(146, 65, 'pending', 1, NULL, NULL),
(148, 73, 'pending', 1, NULL, NULL),
(148, 75, 'pending', 1, NULL, NULL),
(149, 77, 'approved', 1, NULL, NULL),
(149, 78, 'approved', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `group_supervisor`
--

CREATE TABLE `group_supervisor` (
  `supervisorId` bigint UNSIGNED NOT NULL,
  `groupid` bigint UNSIGNED NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `group_supervisor`
--

INSERT INTO `group_supervisor` (`supervisorId`, `groupid`, `status`, `created_at`, `updated_at`) VALUES
(1, 6, 'pending', '2025-05-02 13:20:55', '2025-05-02 13:20:55'),
(1, 7, 'pending', '2025-05-02 14:13:04', '2025-05-02 14:13:04'),
(1, 8, 'pending', '2025-05-02 14:17:57', '2025-05-02 14:17:57'),
(1, 9, 'pending', '2025-05-02 14:20:25', '2025-05-02 14:20:25'),
(1, 52, 'approved', NULL, '2025-05-17 18:11:51'),
(1, 53, 'pending', NULL, NULL),
(1, 55, 'pending', NULL, NULL),
(1, 58, 'pending', NULL, NULL),
(1, 59, 'pending', NULL, NULL),
(1, 60, 'pending', NULL, NULL),
(1, 61, 'pending', NULL, NULL),
(1, 62, 'approved', NULL, '2025-05-17 18:12:23'),
(1, 64, 'pending', NULL, NULL),
(1, 65, 'pending', NULL, NULL),
(2, 63, 'pending', NULL, NULL),
(3, 63, 'pending', NULL, NULL),
(4, 45, 'pending', '2025-05-07 04:25:33', '2025-05-07 04:25:33'),
(4, 49, 'pending', '2025-05-07 11:46:56', '2025-05-07 11:46:56'),
(4, 51, 'pending', '2025-05-07 15:31:43', '2025-05-07 15:31:43'),
(4, 73, 'pending', NULL, NULL),
(4, 75, 'pending', NULL, NULL),
(4, 81, 'pending', NULL, NULL),
(5, 77, 'pending', NULL, NULL),
(5, 78, 'pending', NULL, NULL),
(5, 79, 'pending', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED NOT NULL,
  `leader_id` bigint UNSIGNED NOT NULL,
  `supervisor_id` bigint UNSIGNED NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `meeting_time` datetime NOT NULL,
  `status` enum('proposed','tentative','confirmed','canceled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'proposed',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `meetings`
--

INSERT INTO `meetings` (`id`, `group_id`, `leader_id`, `supervisor_id`, `description`, `meeting_time`, `status`, `created_at`, `updated_at`) VALUES
(1, 62, 4, 1, 'مراجعة المرحلة النهائية', '2025-06-10 10:00:00', 'canceled', '2025-05-18 06:09:54', '2025-05-18 13:36:35'),
(2, 62, 4, 1, 'مراجعة المرحلة النهائية', '2025-06-11 14:30:00', 'tentative', '2025-05-18 06:09:54', '2025-05-18 13:36:35');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(2, '2019_08_19_000000_create_failed_jobs_table', 1),
(3, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(4, '2025_03_10_124240_create_users_table', 1),
(5, '2025_03_10_124539_create_students_table', 1),
(6, '2025_03_10_124539_create_supervisors_table', 1),
(7, '2025_03_10_124540_create_department_heads_table', 1),
(8, '2025_03_10_124540_create_project_coordinators_table', 1),
(9, '2025_03_10_124541_create_alumni_table', 1),
(10, '2025_03_14_142121_update_users_table', 1),
(11, '2025_04_09_200307_create_project_proposals_table', 2),
(12, '2025_04_10_080119_create_proposal_relations_tables', 3),
(13, '2025_04_14_101408_add_requirements_to_project_proposals_table', 4),
(14, '2025_04_23_081735_create_notifications_table', 5),
(15, '2025_04_23_222205_create_projects_table', 6),
(16, '2025_04_24_163506_create_discussionschedules_table', 6),
(17, '2025_05_02_143337_create_groups_table', 7),
(20, '2025_05_02_143707_create_group_student_table', 8),
(21, '2025_05_02_143816_create_group_supervisor_table', 8),
(22, '2025_05_04_123431_create_skills_table', 9),
(23, '2025_05_04_123517_create_skill_student_table', 9),
(24, '2025_05_04_182410_add_experience_and_gpa_to_students_table', 10),
(25, '2025_05_07_085338_create_project_stages_table', 11),
(26, '2025_05_07_085437_create_stage_submissions_table', 11),
(27, '2025_05_14_035615_create_tasks_table', 12),
(28, '2025_05_14_035617_create_task_submissions_table', 13),
(29, '2025_05_14_045315_add_is_leader_to_group_student_table', 14),
(30, '2025_05_14_215532_create_resources_table', 15),
(31, '2025_05_16_121137_create_evaluation_criteria_table', 16),
(32, '2025_05_16_121144_create_peer_evaluations_table', 16),
(34, '2025_05_17_085048_add_is_leader_to_students_table', 18),
(35, '2025_05_14_191304_create_meetings_table', 19),
(36, '2025_05_19_191804_add_profile_picture_to_users_table', 20),
(37, '2025_05_23_141630_add_phone_to_users_table', 21),
(38, '2025_05_23_165751_add_university_info_to_students_table', 22),
(39, '2025_05_24_183519_enhance_student_experiences', 23),
(40, '2025_05_27_035759_add_group_details_to_schedules_table', 24),
(41, '2025_06_02_212452_add_group_id_to_project_proposals_table', 25),
(42, '2025_06_02_212524_remove_leader_id_from_project_proposals_table', 25),
(43, '2025_06_05_110009_add_type_to_projects_table', 26),
(44, '2025_06_06_061943_create_academic_periods_table', 27),
(45, '2025_06_07_071303_add_academic_period_to_projects', 28),
(46, '2025_06_07_152352_update_projects_table_for_multiple_periods', 29),
(47, '2025_06_07_162023_create_academic_period_project_table', 30),
(48, '2025_06_07_170705_create_academic_period_project_table', 31);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint UNSIGNED NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint UNSIGNED NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES
(1, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u0647\\u0630\\u0627 \\u0627\\u062e\\u062a\\u0628\\u0627\\u0631 \\u0644\\u0644\\u0625\\u0634\\u0639\\u0627\\u0631 \\u0627\\u0644\\u0641\\u0648\\u0631\\u064a\",\"time\":\"2025-04-24 10:44:08\",\"proposal_id\":123,\"custom_data\":\"\\u0623\\u064a \\u0628\\u064a\\u0627\\u0646\\u0627\\u062a \\u0625\\u0636\\u0627\\u0641\\u064a\\u0629\"}', NULL, '2025-04-24 07:44:08', '2025-04-24 07:44:08'),
(2, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u0647\\u0630\\u0627 \\u0627\\u062e\\u062a\\u0628\\u0627\\u0631 \\u0644\\u0644\\u0625\\u0634\\u0639\\u0627\\u0631 \\u0627\\u0644\\u0641\\u0648\\u0631\\u064a\",\"time\":\"2025-04-24 10:24:03\",\"proposal_id\":123,\"custom_data\":\"\\u0623\\u064a \\u0628\\u064a\\u0627\\u0646\\u0627\\u062a \\u0625\\u0636\\u0627\\u0641\\u064a\\u0629\"}', NULL, '2025-04-24 07:24:03', '2025-04-24 07:24:03'),
(3, 'real_time', 'App\\Models\\User', 10, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0644\\u0644\\u0627\\u0646\\u0636\\u0645\\u0627\\u0645 \\u0625\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-02 17:17:57\"}', NULL, '2025-05-02 14:17:57', '2025-05-02 14:17:57'),
(4, 'real_time', 'App\\Models\\User', 10, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0644\\u0644\\u0627\\u0646\\u0636\\u0645\\u0627\\u0645 \\u0625\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-02 17:20:25\"}', NULL, '2025-05-02 14:20:25', '2025-05-02 14:20:25'),
(5, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-02 17:20:28\"}', NULL, '2025-05-02 14:20:28', '2025-05-02 14:20:28'),
(6, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0644\\u0644\\u0627\\u0646\\u0636\\u0645\\u0627\\u0645 \\u0625\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-03 19:42:38\"}', NULL, '2025-05-03 16:42:38', '2025-05-03 16:42:38'),
(7, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-03 19:42:41\"}', NULL, '2025-05-03 16:42:41', '2025-05-03 16:42:41'),
(8, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0644\\u0644\\u0627\\u0646\\u0636\\u0645\\u0627\\u0645 \\u0625\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-07 07:25:33\"}', NULL, '2025-05-07 04:25:33', '2025-05-07 04:25:33'),
(9, 'real_time', 'App\\Models\\User', 171, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-07 07:25:38\"}', NULL, '2025-05-07 04:25:38', '2025-05-07 04:25:38'),
(10, 'real_time', 'App\\Models\\User', 10, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0644\\u0644\\u0627\\u0646\\u0636\\u0645\\u0627\\u0645 \\u0625\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-07 14:46:06\"}', NULL, '2025-05-07 11:46:07', '2025-05-07 11:46:07'),
(11, 'real_time', 'App\\Models\\User', 15, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0644\\u0644\\u0627\\u0646\\u0636\\u0645\\u0627\\u0645 \\u0625\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-07 14:46:11\"}', NULL, '2025-05-07 11:46:11', '2025-05-07 11:46:11'),
(12, 'real_time', 'App\\Models\\User', 171, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-07 14:46:56\"}', NULL, '2025-05-07 11:46:56', '2025-05-07 11:46:56'),
(13, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0644\\u0644\\u0627\\u0646\\u0636\\u0645\\u0627\\u0645 \\u0625\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-07 18:31:43\"}', NULL, '2025-05-07 15:31:43', '2025-05-07 15:31:43'),
(14, 'real_time', 'App\\Models\\User', 171, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-07 18:31:47\"}', NULL, '2025-05-07 15:31:47', '2025-05-07 15:31:47'),
(15, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0644\\u0644\\u0627\\u0646\\u0636\\u0645\\u0627\\u0645 \\u0625\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-07 18:56:20\"}', NULL, '2025-05-07 15:56:20', '2025-05-07 15:56:20'),
(16, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u0627\\u062e\\u062a\\u064a\\u0627\\u0631\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\\u060c \\u064a\\u0631\\u062c\\u0649 \\u0627\\u0644\\u0645\\u0648\\u0627\\u0641\\u0642\\u0629.\",\"time\":\"2025-05-07 18:56:20\"}', NULL, '2025-05-07 15:56:20', '2025-05-07 15:56:20'),
(17, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"(\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-05-17 09:38:59\"}', NULL, '2025-05-17 06:38:59', '2025-05-17 06:38:59'),
(18, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062c\\u062f\\u064a\\u062f\",\"time\":\"2025-05-17 09:39:04\"}', NULL, '2025-05-17 06:39:04', '2025-05-17 06:39:04'),
(19, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0630\\u0643\\u0627\\u0621 \\u0627\\u0644\\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a\",\"time\":\"2025-05-17 10:20:42\"}', NULL, '2025-05-17 07:20:42', '2025-05-17 07:20:42'),
(20, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0630\\u0643\\u0627\\u0621 \\u0627\\u0644\\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a\",\"time\":\"2025-05-17 10:20:42\"}', NULL, '2025-05-17 07:20:42', '2025-05-17 07:20:42'),
(21, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 12:27:29\"}', NULL, '2025-05-17 09:27:29', '2025-05-17 09:27:29'),
(22, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 12:27:30\"}', NULL, '2025-05-17 09:27:30', '2025-05-17 09:27:30'),
(23, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 12:27:30\"}', NULL, '2025-05-17 09:27:30', '2025-05-17 09:27:30'),
(24, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 15:07:37\"}', NULL, '2025-05-17 12:07:38', '2025-05-17 12:07:38'),
(25, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 15:07:54\"}', NULL, '2025-05-17 12:07:54', '2025-05-17 12:07:54'),
(26, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 15:07:54\"}', NULL, '2025-05-17 12:07:54', '2025-05-17 12:07:54'),
(27, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 18:36:48\"}', NULL, '2025-05-17 15:36:48', '2025-05-17 15:36:48'),
(28, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 18:36:48\"}', NULL, '2025-05-17 15:36:48', '2025-05-17 15:36:48'),
(29, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 18:36:48\"}', NULL, '2025-05-17 15:36:48', '2025-05-17 15:36:48'),
(30, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 19:27:47\"}', NULL, '2025-05-17 16:27:47', '2025-05-17 16:27:47'),
(31, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 19:27:50\"}', NULL, '2025-05-17 16:27:50', '2025-05-17 16:27:50'),
(32, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 19:27:50\"}', NULL, '2025-05-17 16:27:50', '2025-05-17 16:27:50'),
(33, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 19:28:23\"}', NULL, '2025-05-17 16:28:23', '2025-05-17 16:28:23'),
(34, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 19:28:23\"}', NULL, '2025-05-17 16:28:23', '2025-05-17 16:28:23'),
(35, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\",\"time\":\"2025-05-17 19:28:24\"}', NULL, '2025-05-17 16:28:24', '2025-05-17 16:28:24'),
(36, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645 \\u062a\\u062d\\u062f\\u064a\\u062f \\u0645\\u0648\\u0639\\u062f \\u0627\\u0644\\u0645\\u0646\\u0627\\u0642\\u0634\\u0629 \\u0645\\u0631\\u062d\\u0644\\u064a\\u0629 \\u0641\\u064a 2025-06-20 \\u0627\\u0644\\u0633\\u0627\\u0639\\u0629 10:30 \\u0641\\u064a \\u0627\\u0644\\u0642\\u0627\\u0639\\u0629 \\u0627\\u0644\\u0631\\u0626\\u064a\\u0633\\u064a\\u0629 - \\u0645\\u0628\\u0646\\u0649 \\u0627\\u0644\\u0647\\u0646\\u062f\\u0633\\u0629\",\"time\":\"2025-05-27 04:34:00\",\"type\":\"discussion_schedule\",\"schedule_id\":6,\"group_id\":52}', NULL, '2025-05-27 01:34:00', '2025-05-27 01:34:00'),
(37, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u062a\\u062d\\u062f\\u064a\\u062f \\u0645\\u0648\\u0639\\u062f \\u0627\\u0644\\u0645\\u0646\\u0627\\u0642\\u0634\\u0629 \\u0645\\u0631\\u062d\\u0644\\u064a\\u0629 \\u0641\\u064a 2025-06-20 \\u0627\\u0644\\u0633\\u0627\\u0639\\u0629 10:30 \\u0641\\u064a \\u0627\\u0644\\u0642\\u0627\\u0639\\u0629 \\u0627\\u0644\\u0631\\u0626\\u064a\\u0633\\u064a\\u0629 - \\u0645\\u0628\\u0646\\u0649 \\u0627\\u0644\\u0647\\u0646\\u062f\\u0633\\u0629\",\"time\":\"2025-05-27 04:34:05\",\"type\":\"discussion_schedule\",\"schedule_id\":6,\"group_id\":52}', NULL, '2025-05-27 01:34:05', '2025-05-27 01:34:05'),
(38, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-05 12:06:52\"}', NULL, '2025-06-05 09:06:52', '2025-06-05 09:06:52'),
(39, 'real_time', 'App\\Models\\User', 10, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-05 12:06:57\"}', NULL, '2025-06-05 09:06:57', '2025-06-05 09:06:57'),
(40, 'real_time', 'App\\Models\\User', 256, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644 (\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-06-05 12:06:57\"}', NULL, '2025-06-05 09:06:57', '2025-06-05 09:06:57'),
(41, 'real_time', 'App\\Models\\User', 11, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-05 12:06:57\"}', NULL, '2025-06-05 09:06:57', '2025-06-05 09:06:57'),
(42, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0646\\u0638\\u0627\\u0645 \\u0627\\u0644\\u0630\\u0643\\u0627\\u0621 \\u0627\\u0644\\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a (\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-06-07 08:38:45\"}', NULL, '2025-06-07 05:38:45', '2025-06-07 05:38:45'),
(43, 'real_time', 'App\\Models\\User', 10, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0646\\u0638\\u0627\\u0645 \\u0627\\u0644\\u0630\\u0643\\u0627\\u0621 \\u0627\\u0644\\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a\",\"time\":\"2025-06-07 08:38:50\"}', NULL, '2025-06-07 05:38:50', '2025-06-07 05:38:50'),
(44, 'real_time', 'App\\Models\\User', 171, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0646\\u0638\\u0627\\u0645 \\u0627\\u0644\\u0630\\u0643\\u0627\\u0621 \\u0627\\u0644\\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a\",\"time\":\"2025-06-07 08:38:50\"}', NULL, '2025-06-07 05:38:50', '2025-06-07 05:38:50'),
(45, 'real_time', 'App\\Models\\User', 172, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0646\\u0638\\u0627\\u0645 \\u0627\\u0644\\u0630\\u0643\\u0627\\u0621 \\u0627\\u0644\\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a\",\"time\":\"2025-06-07 08:38:50\"}', NULL, '2025-06-07 05:38:50', '2025-06-07 05:38:50'),
(61, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-07 17:08:13\"}', NULL, '2025-06-07 14:08:13', '2025-06-07 14:08:13'),
(62, 'real_time', 'App\\Models\\User', 10, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-07 17:08:13\"}', NULL, '2025-06-07 14:08:13', '2025-06-07 14:08:13'),
(63, 'real_time', 'App\\Models\\User', 258, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644 (\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-06-07 17:08:13\"}', NULL, '2025-06-07 14:08:13', '2025-06-07 14:08:13'),
(64, 'real_time', 'App\\Models\\User', 171, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-07 17:08:13\"}', NULL, '2025-06-07 14:08:13', '2025-06-07 14:08:13'),
(65, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-07 17:09:51\"}', NULL, '2025-06-07 14:09:51', '2025-06-07 14:09:51'),
(66, 'real_time', 'App\\Models\\User', 10, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-07 17:09:51\"}', NULL, '2025-06-07 14:09:51', '2025-06-07 14:09:51'),
(67, 'real_time', 'App\\Models\\User', 258, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644 (\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-06-07 17:09:51\"}', NULL, '2025-06-07 14:09:51', '2025-06-07 14:09:51'),
(68, 'real_time', 'App\\Models\\User', 171, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-07 17:09:51\"}', NULL, '2025-06-07 14:09:51', '2025-06-07 14:09:51'),
(69, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-07 17:12:01\"}', NULL, '2025-06-07 14:12:01', '2025-06-07 14:12:01'),
(70, 'real_time', 'App\\Models\\User', 10, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-07 17:12:01\"}', NULL, '2025-06-07 14:12:01', '2025-06-07 14:12:01'),
(71, 'real_time', 'App\\Models\\User', 258, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644 (\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-06-07 17:12:01\"}', NULL, '2025-06-07 14:12:01', '2025-06-07 14:12:01'),
(72, 'real_time', 'App\\Models\\User', 171, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0627\\u0644\\u0641\\u0635\\u0644 \\u0627\\u0644\\u062f\\u0631\\u0627\\u0633\\u064a \\u0627\\u0644\\u0623\\u0648\\u0644\",\"time\":\"2025-06-07 17:12:01\"}', NULL, '2025-06-07 14:12:01', '2025-06-07 14:12:01'),
(73, 'real_time', 'App\\Models\\User', 15, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 madmf\",\"time\":\"2025-06-08 03:24:52\"}', NULL, '2025-06-08 00:24:52', '2025-06-08 00:24:52'),
(74, 'real_time', 'App\\Models\\User', 259, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 madmf (\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-06-08 03:24:52\"}', NULL, '2025-06-08 00:24:52', '2025-06-08 00:24:52'),
(75, 'real_time', 'App\\Models\\User', 173, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 madmf\",\"time\":\"2025-06-08 03:24:52\"}', NULL, '2025-06-08 00:24:52', '2025-06-08 00:24:52'),
(76, 'real_time', 'App\\Models\\User', 15, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u064a\\u0628\\u062a\\u0649\\u0634\\u0645\",\"time\":\"2025-06-08 03:33:32\"}', NULL, '2025-06-08 00:33:32', '2025-06-08 00:33:32'),
(77, 'real_time', 'App\\Models\\User', 259, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u064a\\u0628\\u062a\\u0649\\u0634\\u0645 (\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-06-08 03:33:37\"}', NULL, '2025-06-08 00:33:37', '2025-06-08 00:33:37'),
(78, 'real_time', 'App\\Models\\User', 172, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u064a\\u0628\\u062a\\u0649\\u0634\\u0645\",\"time\":\"2025-06-08 03:33:37\"}', NULL, '2025-06-08 00:33:37', '2025-06-08 00:33:37'),
(79, 'real_time', 'App\\Models\\User', 16, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0629\\u0649\\u0634\\u064a\\u0628\\u0645\\u0646\\u0649\",\"time\":\"2025-06-08 03:34:29\"}', NULL, '2025-06-08 00:34:29', '2025-06-08 00:34:29'),
(80, 'real_time', 'App\\Models\\User', 259, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 \\u0629\\u0649\\u0634\\u064a\\u0628\\u0645\\u0646\\u0649 (\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-06-08 03:34:30\"}', NULL, '2025-06-08 00:34:30', '2025-06-08 00:34:30'),
(81, 'real_time', 'App\\Models\\User', 172, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 \\u0629\\u0649\\u0634\\u064a\\u0628\\u0645\\u0646\\u0649\",\"time\":\"2025-06-08 03:34:30\"}', NULL, '2025-06-08 00:34:30', '2025-06-08 00:34:30'),
(82, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 ,nv,mznln (\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-06-08 03:42:20\"}', NULL, '2025-06-08 00:42:20', '2025-06-08 00:42:20'),
(83, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 ,nv,mznln\",\"time\":\"2025-06-08 03:42:20\"}', NULL, '2025-06-08 00:42:20', '2025-06-08 00:42:20'),
(84, 'real_time', 'App\\Models\\User', 172, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 ,nv,mznln\",\"time\":\"2025-06-08 03:42:20\"}', NULL, '2025-06-08 00:42:20', '2025-06-08 00:42:20'),
(85, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 fnmdakm (\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-06-08 03:43:23\"}', NULL, '2025-06-08 00:43:23', '2025-06-08 00:43:23'),
(86, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 fnmdakm\",\"time\":\"2025-06-08 03:43:23\"}', NULL, '2025-06-08 00:43:23', '2025-06-08 00:43:23'),
(87, 'real_time', 'App\\Models\\User', 172, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 fnmdakm\",\"time\":\"2025-06-08 03:43:23\"}', NULL, '2025-06-08 00:43:23', '2025-06-08 00:43:23'),
(88, 'real_time', 'App\\Models\\User', 7, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 lav,m (\\u0623\\u0646\\u062a \\u0627\\u0644\\u0642\\u0627\\u0626\\u062f)\",\"time\":\"2025-06-08 03:44:13\"}', NULL, '2025-06-08 00:44:13', '2025-06-08 00:44:13'),
(89, 'real_time', 'App\\Models\\User', 14, '{\"message\":\"\\u062a\\u0645\\u062a \\u062f\\u0639\\u0648\\u062a\\u0643 \\u0644\\u0645\\u0634\\u0631\\u0648\\u0639 lav,m\",\"time\":\"2025-06-08 03:44:13\"}', NULL, '2025-06-08 00:44:13', '2025-06-08 00:44:13'),
(90, 'real_time', 'App\\Models\\User', 171, '{\"message\":\"\\u062a\\u0645 \\u062a\\u0639\\u064a\\u064a\\u0646\\u0643 \\u0643\\u0645\\u0634\\u0631\\u0641 \\u0639\\u0644\\u0649 \\u0645\\u0634\\u0631\\u0648\\u0639 lav,m\",\"time\":\"2025-06-08 03:44:13\"}', NULL, '2025-06-08 00:44:13', '2025-06-08 00:44:13');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `peer_evaluations`
--

CREATE TABLE `peer_evaluations` (
  `evaluation_id` bigint UNSIGNED NOT NULL,
  `evaluator_user_id` bigint UNSIGNED NOT NULL,
  `evaluated_user_id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED NOT NULL,
  `criteria_id` bigint UNSIGNED NOT NULL,
  `rate` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `peer_evaluations`
--

INSERT INTO `peer_evaluations` (`evaluation_id`, `evaluator_user_id`, `evaluated_user_id`, `group_id`, `criteria_id`, `rate`, `created_at`, `updated_at`) VALUES
(1, 14, 11, 52, 2, 4, '2025-05-16 14:30:37', '2025-05-16 14:30:37');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `projectid` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `startdate` date NOT NULL,
  `enddate` date NOT NULL,
  `status` enum('pending','in_progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `headid` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `type` enum('semester','graduation') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'semester'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`projectid`, `title`, `description`, `startdate`, `enddate`, `status`, `headid`, `created_at`, `updated_at`, `type`) VALUES
(1, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-02 12:49:07', '2025-05-02 12:49:07', 'semester'),
(2, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-02 12:59:10', '2025-05-02 12:59:10', 'semester'),
(3, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-02 12:59:31', '2025-05-02 12:59:31', 'semester'),
(4, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-02 12:59:59', '2025-05-02 12:59:59', 'semester'),
(5, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-02 13:06:20', '2025-05-02 13:06:20', 'semester'),
(6, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-02 13:13:44', '2025-05-02 13:13:44', 'semester'),
(7, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-02 13:14:18', '2025-05-02 13:14:18', 'semester'),
(8, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-02 13:20:55', '2025-05-02 13:20:55', 'semester'),
(9, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-02 14:13:04', '2025-05-02 14:13:04', 'semester'),
(10, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-02 14:17:57', '2025-05-02 14:17:57', 'semester'),
(11, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-02 14:20:25', '2025-05-02 14:20:25', 'semester'),
(12, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:36', '2025-05-03 08:40:36', 'semester'),
(13, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:40', '2025-05-03 08:40:40', 'semester'),
(14, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:43', '2025-05-03 08:40:43', 'semester'),
(15, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:44', '2025-05-03 08:40:44', 'semester'),
(16, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:45', '2025-05-03 08:40:45', 'semester'),
(17, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:46', '2025-05-03 08:40:46', 'semester'),
(18, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:46', '2025-05-03 08:40:46', 'semester'),
(19, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:49', '2025-05-03 08:40:49', 'semester'),
(20, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:49', '2025-05-03 08:40:49', 'semester'),
(21, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:51', '2025-05-03 08:40:51', 'semester'),
(22, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:53', '2025-05-03 08:40:53', 'semester'),
(23, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:54', '2025-05-03 08:40:54', 'semester'),
(24, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:55', '2025-05-03 08:40:55', 'semester'),
(25, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:40:55', '2025-05-03 08:40:55', 'semester'),
(26, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:41:01', '2025-05-03 08:41:01', 'semester'),
(27, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:41:02', '2025-05-03 08:41:02', 'semester'),
(28, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:41:03', '2025-05-03 08:41:03', 'semester'),
(29, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:41:03', '2025-05-03 08:41:03', 'semester'),
(30, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:41:04', '2025-05-03 08:41:04', 'semester'),
(31, 'ksfdkfm', 'jfskljds', '2025-05-30', '2025-05-30', 'pending', 7, '2025-05-03 08:41:41', '2025-05-03 08:41:41', 'semester'),
(32, 'ksfdkfm', 'njfshj', '2025-05-29', '2025-05-31', 'pending', 7, '2025-05-03 08:43:33', '2025-05-03 08:43:33', 'semester'),
(33, 'ksfdkfm', 'njfshj', '2025-05-29', '2025-05-31', 'pending', 7, '2025-05-03 08:43:35', '2025-05-03 08:43:35', 'semester'),
(34, 'ksfdkfm', 'njfshj', '2025-05-29', '2025-05-31', 'pending', 7, '2025-05-03 08:43:36', '2025-05-03 08:43:36', 'semester'),
(35, 'ksfdkfm', 'njfshj', '2025-05-29', '2025-05-31', 'pending', 7, '2025-05-03 08:43:37', '2025-05-03 08:43:37', 'semester'),
(36, 'ksfdkfm', 'njfshj', '2025-05-29', '2025-05-31', 'pending', 7, '2025-05-03 08:43:38', '2025-05-03 08:43:38', 'semester'),
(37, 'ksfdkfm', 'njfshj', '2025-05-29', '2025-05-31', 'pending', 7, '2025-05-03 08:43:44', '2025-05-03 08:43:44', 'semester'),
(38, 'ksfdkfm', 'njfshj', '2025-05-29', '2025-05-31', 'pending', 7, '2025-05-03 08:43:47', '2025-05-03 08:43:47', 'semester'),
(39, 'ksfdkfm', 'njfshj', '2025-05-29', '2025-05-31', 'pending', 7, '2025-05-03 08:43:48', '2025-05-03 08:43:48', 'semester'),
(40, 'ksfdkfm', 'njfshj', '2025-05-29', '2025-05-31', 'pending', 7, '2025-05-03 08:44:22', '2025-05-03 08:44:22', 'semester'),
(41, 'ksfdkfm', 'njfshj', '2025-05-29', '2025-05-31', 'pending', 7, '2025-05-03 08:44:22', '2025-05-03 08:44:22', 'semester'),
(42, 'ksfdkfm', 'njfshj', '2025-05-29', '2025-05-31', 'pending', 7, '2025-05-03 08:44:23', '2025-05-03 08:44:23', 'semester'),
(43, 'ksfdkfm', 'وسةشيبة', '2025-05-22', '2025-05-31', 'pending', 7, '2025-05-03 09:00:23', '2025-05-03 09:00:23', 'semester'),
(44, 'ksfdkfm', 'وسةشيبة', '2025-05-22', '2025-05-31', 'pending', 7, '2025-05-03 09:01:23', '2025-05-03 09:01:23', 'semester'),
(45, 'ksfdkfm', 'dmkfkma', '2025-05-08', '2025-05-29', 'pending', 7, '2025-05-03 16:21:38', '2025-05-03 16:21:38', 'semester'),
(47, 'نظام إدارة المشاريع', 'نظام لتنسيق المشاريع الطلابية مع المشرفين.', '2025-06-01', '2025-12-01', 'pending', 7, '2025-05-07 04:25:33', '2025-05-07 04:25:33', 'semester'),
(48, 'نظام إدارة التخرج', 'مشروع لتنسيق ومتابعة مشاريع التخرج', '2025-05-01', '2025-07-01', 'pending', 7, '2025-05-07 09:00:46', '2025-05-07 09:00:46', 'semester'),
(49, 'مشروع تخرج جديد', 'وصف تفصيلي للمشروع وأهدافه.', '2025-06-01', '2025-12-15', 'pending', 7, '2025-05-07 11:46:06', '2025-05-07 11:46:06', 'semester'),
(50, 'مشروع تخرج جديد', 'وصف تفصيلي للمشروع وأهدافه.', '2025-06-01', '2025-12-15', 'pending', 7, '2025-05-07 11:46:30', '2025-05-07 11:46:30', 'semester'),
(51, 'مشروع تخرج جديد', 'وصف تفصيلي للمشروع وأهدافه.', '2025-06-01', '2025-12-15', 'pending', 7, '2025-05-07 11:46:56', '2025-05-07 11:46:56', 'semester'),
(52, 'مشروع تخرج جديد', 'وصف تفصيلي للمشروع وأهدافه.', '2025-06-01', '2025-12-15', 'pending', 171, '2025-05-07 12:24:32', '2025-05-07 12:24:32', 'semester'),
(53, 'مشروع التخرج', 'نظام إدارة المشاريع الطلابية', '2024-06-01', '2024-12-31', 'pending', 7, '2025-05-07 15:30:06', '2025-05-07 15:30:06', 'semester'),
(54, 'مشروع التخرج', 'نظام إدارة المشاريع الطلابية', '2024-06-01', '2024-12-31', 'pending', 7, '2025-05-07 15:31:42', '2025-05-07 15:31:42', 'semester'),
(55, 'مشروع تطوير نظام إدارة المهام', 'مشروع لإنشاء نظام متكامل لإدارة المهام والفريق', '2024-01-01', '2024-06-30', 'pending', 7, '2025-05-07 15:56:20', '2025-05-07 15:56:20', 'semester'),
(56, 'مشروع الذكاء الاصطناعي', 'تصنيف الصور باستخدام التعلم العميق', '2024-01-01', '2024-06-01', 'pending', 14, '2025-05-17 06:38:59', '2025-05-17 06:38:59', 'semester'),
(58, 'مشروع الذكاء الاصطناعي', 'تصنيف الصور باستخدام التعلم العميق', '2024-01-01', '2024-06-01', 'pending', 14, '2025-05-17 07:20:42', '2025-05-17 07:20:42', 'semester'),
(61, 'مشروع تجريبي', 'وصف المشروع الاختباري', '2024-01-01', '2024-06-30', 'pending', 14, '2025-05-17 09:27:29', '2025-05-17 09:27:29', 'semester'),
(62, 'مشروع تجريبي', 'وصف المشروع الاختباري', '2024-01-01', '2024-06-30', 'pending', 14, '2025-05-17 12:07:35', '2025-05-17 12:07:35', 'semester'),
(63, 'مشروع تجريبي', 'وصف المشروع الاختباري', '2024-01-01', '2024-06-30', 'pending', 14, '2025-05-17 15:36:48', '2025-05-17 15:36:48', 'semester'),
(64, 'مشروع تجريبي', 'وصف المشروع الاختباري', '2024-01-01', '2024-06-30', 'pending', 14, '2025-05-17 16:27:47', '2025-05-17 16:27:47', 'semester'),
(65, 'مشروع تجريبي', 'وصف المشروع الاختباري', '2024-01-01', '2024-06-30', 'pending', 14, '2025-05-17 16:28:23', '2025-05-17 16:28:23', 'semester'),
(66, 'vadm', 'ndcnakcnd', '2025-06-03', '2025-06-10', 'pending', 7, '2025-06-03 04:46:14', '2025-06-03 04:46:14', 'semester'),
(67, 'kmadksm', 'mksamd', '2025-06-03', '2025-06-17', 'pending', 7, '2025-06-03 05:07:59', '2025-06-03 05:07:59', 'semester'),
(68, 'مشروع الفصل الدراسي الأول', 'وصف المشروع الفصلي', '2023-09-01', '2023-12-31', 'completed', 256, '2025-06-05 09:06:52', '2025-06-05 09:06:52', 'semester'),
(77, 'مشروع الفصل الدراسي الأول', 'وصف المشروع الفصلي', '2024-09-17', '2024-11-20', 'completed', 258, '2025-06-07 14:08:13', '2025-06-07 14:08:13', 'semester'),
(79, 'مشروع الفصل الدراسي الأول', 'وصف المشروع الفصلي', '2023-09-01', '2024-05-16', 'pending', 258, '2025-06-07 14:12:01', '2025-06-07 14:12:01', 'graduation'),
(81, 'يبتىشم', 'ىبسيى', '2023-09-01', '2024-01-15', 'completed', 259, '2025-06-08 00:33:32', '2025-06-08 00:33:32', 'semester'),
(82, 'ةىشيبمنى', 'بشيمنبىم', '2023-09-01', '2024-05-16', 'pending', 259, '2025-06-08 00:34:29', '2025-06-08 00:34:29', 'graduation'),
(83, ',nv,mznln', 'nzdn', '2023-09-01', '2024-01-15', 'completed', 7, '2025-06-08 00:42:20', '2025-06-08 00:42:20', 'semester'),
(85, 'lav,m', 'lkmvsf', '2023-09-01', '2024-05-16', 'pending', 7, '2025-06-08 00:44:13', '2025-06-08 00:44:13', 'graduation');

-- --------------------------------------------------------

--
-- Table structure for table `project_coordinators`
--

CREATE TABLE `project_coordinators` (
  `coordinatorId` bigint UNSIGNED NOT NULL,
  `userId` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_coordinators`
--

INSERT INTO `project_coordinators` (`coordinatorId`, `userId`, `created_at`, `updated_at`) VALUES
(1, 9, '2025-04-09 09:56:03', '2025-04-09 09:56:03');

-- --------------------------------------------------------

--
-- Table structure for table `project_proposals`
--

CREATE TABLE `project_proposals` (
  `proposalId` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `problem_statement` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `problem_background` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `problem_mindmap_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proposed_solution` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `methodology` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Agile',
  `technology_stack` json DEFAULT NULL,
  `functional_requirements` text COLLATE utf8mb4_unicode_ci,
  `non_functional_requirements` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_proposals`
--

INSERT INTO `project_proposals` (`proposalId`, `group_id`, `title`, `problem_statement`, `problem_background`, `problem_mindmap_path`, `proposed_solution`, `methodology`, `technology_stack`, `functional_requirements`, `non_functional_requirements`, `created_at`, `updated_at`) VALUES
(1, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/4ooy46tdtFg6WZmPVO7ZUj9F2TKNpiYk6K2DWlb1.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', NULL, NULL, '2025-04-11 14:24:19', '2025-04-11 14:24:19'),
(2, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/JOcoXyBcOwC4CvpEALpB0EcezBWv85vtGoxENHZo.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', NULL, NULL, '2025-04-11 14:25:20', '2025-04-11 14:25:20'),
(3, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/dK0GxRYm6lILKxy2VKnvjb2BhOk7Fkr1M8TCBE37.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', NULL, NULL, '2025-04-11 14:25:35', '2025-04-11 14:25:35'),
(4, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/X2ZtX3siwxWTTQmsnpXoCDnVNSjoChJBaxQXpX0m.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', NULL, NULL, '2025-04-11 14:25:46', '2025-04-11 14:25:46'),
(5, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/YgrtycKMw7JRrjN0eU3f2GFkm4SzziIp1Ndf8STk.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', NULL, NULL, '2025-04-11 14:26:08', '2025-04-11 14:26:08'),
(6, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/QMxk2mpqMfi6jzUSDsUr280RmxF1cxaDBHpWnec1.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', NULL, NULL, '2025-04-11 14:54:10', '2025-04-11 14:54:10'),
(7, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/KYE9JHOCMJ50CUF6IBx2Pb4DNj1kGa9mQnLoe5DH.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', NULL, NULL, '2025-04-11 15:02:13', '2025-04-11 15:02:13'),
(8, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير المهارات البحثية .\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .\nأحد التحديات ه...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام،...', 'mindmaps/btgNX9pPZbcyZAdzg0yW1E26jLVzRLJUPkMkYG9j.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع المتميزة. يشمل النظام مكتبة مو...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', NULL, NULL, '2025-04-14 06:13:28', '2025-04-14 06:13:28'),
(9, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير المهارات البحثية .\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .\nأحد التحديات ه...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام،...', 'mindmaps/3klljgUsIADBuJ1bA0BeoamamiKdadXmvA6n9mUQ.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع المتميزة. يشمل النظام مكتبة مو...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '. إنشاء حساب\n2. تسجيل دخول\n3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية\n4. تخصيص صلاحيات لكل نوع حساب\n5. تقسيم المشروع لمراحل متعددة\n6. تحديد مواعيد نهائية لكل مرحلة من المشرف\n7. تقييم كل مرحلة من ا...', '١. الأمن والحماية \n٢.واجهات سهلة الاستخدام', '2025-04-14 08:26:57', '2025-04-14 08:26:57'),
(10, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة , مما يجعل مراقبة التزام الفرق ‏بالخطة الزمنية أمرا  صعبا .‏\nكذلك يؤدي غياب منصة موحدة للتواصل إلى صعوبات في تنظيم المناقشات وتوززيع المهام بين ‏أعضاء الفريق والمشرفين .‏\nيضاف إلى ذلك نقص الموارد التعليمية المتاحة , مما يعوق وصول الطلاب إلى الأدوات والمراجع ‏اللازمة.‏\nكما توجد حاجة إلى نظام لتقييم الأعضاء سريا , وآلية  إدارية للموافقات الإلكترونية , مع إرشاد من ‏الأكاديميين وذوي الخبرة و الطلاب السابقين لتوجيه الطلاب الجدد.‏\nكما أن غياب أداة توصية يمكن أن يُعيق الفرق في اختيار الأعضاء الملائمين، حيث يمكن لنظام ‏التوصية دعم الطلاب باقتراح زملاء لديهم المهارات المناسبة للانضمام إلى مشاريعهم.‏', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم. هذه الطرق تفتقر ‏إلى الكثير من الخصائص التي تتيح الإدارة الفعالة والمنهجية للمشاريع، وهو ما يسبب العديد من ‏المشكلات، منها:‏\n\n‏-‏	صعوبة تنظيم المراحل الزمنية للمشاريع: تعاني الجامعة من عدم وجود تقسيم منظم ‏لمراحل المشاريع مع مواعيد نهائية واضحة، مما يجعل المتابعة والتقييم الدوري أصعب. ‏كما أن غياب التنبيهات الرقمية يؤدي إلى التأخر في تسليم المراحل بسبب الاعتماد على ‏التواصل الفردي والواقعي، وهذا يؤثر على تقدم المشاريع.‏\n‏-‏	غياب أدوات المتابعة والتحليل: باستخدام وسائل التواصل التقليدية، يصبح من الصعب ‏تتبع إحصائيات المشاريع ونسبة الإنجاز وعدد المشاريع المكتملة. كما لا توجد واجهة ‏لمواعيد المناقشات أو نظام لتقديم تقارير رضا الطلاب والمشرفين، مما يؤثر على تقييم ‏العملية التعليمية بصورة شاملة.‏\n\n‏-‏	التحديات في إدارة فرق العمل وتوزيع المهام: يواجه قائد الفريق صعوبة في توزيع المهام ‏وجدولة الاجتماعات بشكل منظم مع المشرفين. ‏\n\n‏-‏	غياب مكتبة موارد منظمة: الطلاب يحتاجون لمكتبة تتضمن مراجع وأدوات علمية تدعم ‏مشاريعهم، مع ميزة البحث السريع عن المعلومات. كما يفتقرون إلى مرونة الوصول لموارد ‏معرفية منسقة، حيث أن الاعتماد على التواصل التقليدي لا يوفر تلك الإمكانية.‏\n\n\n‏-‏	ضعف الخصوصية والتنظيم في الوصول إلى المشاريع: تعاني الفرق من عدم وجود إعدادات ‏خصوصية كافية أو مرونة للوصول إلى مشاريعهم بطريقة متقدمة، وهذا يؤثر على سرية ‏وخصوصية المشاريع. ‏\n\n‏-‏	عدم وجود دعم وإرشاد من الأكاديميين وذوي الخبرة والطلاب السابقين: يفتقر النظام ‏التقليدي إلى وسيلة لربط الطلاب الحاليين بالأكاديميين والطلاب السابقين للاستفادة من ‏خبراتهم، مما يُحرم الطلاب من تبادل الخبرات وتعزيز بيئة أكاديمية مساندة.‏\n\n‏-‏	التحديات التي يواجهها الطلاب عند تشكيل فرق عمل مناسبة. يفتقر الطلاب عادة إلى ‏المعرفة الكافية بمستويات المهارات المختلفة لزملائهم وقدراتهم في مجالات محددة، مما قد ‏يؤدي إلى تشكيل فرق غير متجانسة أو تفتقر للتكامل في الخبرات‎.‎\n\n\nإن تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل ‏المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.‏', 'mindmaps/hda7xEwA36SL32WIMDSJqBEUErXVZhfjK9uXF0mT.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة موارد تدعم تنفيذ المشاريع وتخصيص إعدادات خصوصية لكل ‏فريق، مما يعزز من سرية المشاريع. كما يتيح التواصل بين الطلاب الجدد والطلاب السابقين لتبادل ‏الخبرات، متجاوزاً الاعتماد على التواصل غير الرسمي ويقدم تجربة أكاديمية منظمة وفعالة‎. ‎‏ كما ‏يشمل النظام المقترح نظام توصية لمساعدة الطلاب في اختيار فرقهم حيث يقدم اقتراحات لأعضاء ‏الفريق بناءً على المهارات والتخصصات واهتمامات المشروع، مما يسهم في تشكيل فرق متوازنة ‏وفعّالة ويعزز من فرص نجاح المشاريع الأكاديمية', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم كل مرحلة من المشرف مع إمكانية إضافة ملاحظات للطلاب‏\n‏8. لوحة تحكم تحوي إحصائيات ورسومات بيانية توضح عدد المشاريع والمشاريع المكتملة ونسبة ‏الإنجاز\n‏9. إشعارات تنبيهية‏\n‏10. واجهة لمواعيد المناقشات المرحلية والنهائية‏\n‏11. تقارير عن رضا الطلاب والمشرفين‏\n‏12. اتاحة لقائد الفريق ميزة توزيع المهام‏\n‏13. نظام رسائل\n‏14. إتاحة لقائد الفريق جدولة الاجتماعات مع المشرفين‏\n‏15. لوحة شرف‏\n‏16. واجهة لعرض المشاريع المميزة‏\n‏17. تقييم الطلاب لبعضهم بطريقة سرية ومعايير محددة‏\n‏18. إدارة عمليات موافقة إلكترونية على الانتقال بين مراحل المشروع‏\n‏19. نظام توصية لمساعدة الطلاب في العثور على أعضاء فرق مناسبين\n‏20. مكتبة تحتوي على أدوات ومراجع ومقالات مع ميزة بحث\n‏21. تمكين منسق المشاريع من إدارة المكتبة‏\n‏22. إعدادات خصوصية ومرونة في الوصول لمشروع كل فريق‏\n‏23. السماح للطلاب السابقين بإرشاد الطلاب الحاليين‏\n‏24. مساحة للبحث عن شركاء مشاريع‏', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-14 08:58:08', '2025-04-14 08:58:08'),
(11, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة , مما يجعل مراقبة التزام الفرق ‏بالخطة الزمنية أمرا  صعبا .‏\nكذلك يؤدي غياب منصة موحدة للتواصل إلى صعوبات في تنظيم المناقشات وتوززيع المهام بين ‏أعضاء الفريق والمشرفين .‏\nيضاف إلى ذلك نقص الموارد التعليمية المتاحة , مما يعوق وصول الطلاب إلى الأدوات والمراجع ‏اللازمة.‏\nكما توجد حاجة إلى نظام لتقييم الأعضاء سريا , وآلية  إدارية للموافقات الإلكترونية , مع إرشاد من ‏الأكاديميين وذوي الخبرة و الطلاب السابقين لتوجيه الطلاب الجدد.‏\nكما أن غياب أداة توصية يمكن أن يُعيق الفرق في اختيار الأعضاء الملائمين، حيث يمكن لنظام ‏التوصية دعم الطلاب باقتراح زملاء لديهم المهارات المناسبة للانضمام إلى مشاريعهم.‏', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم. هذه الطرق تفتقر ‏إلى الكثير من الخصائص التي تتيح الإدارة الفعالة والمنهجية للمشاريع، وهو ما يسبب العديد من ‏المشكلات، منها:‏\n\n‏-‏	صعوبة تنظيم المراحل الزمنية للمشاريع: تعاني الجامعة من عدم وجود تقسيم منظم ‏لمراحل المشاريع مع مواعيد نهائية واضحة، مما يجعل المتابعة والتقييم الدوري أصعب. ‏كما أن غياب التنبيهات الرقمية يؤدي إلى التأخر في تسليم المراحل بسبب الاعتماد على ‏التواصل الفردي والواقعي، وهذا يؤثر على تقدم المشاريع.‏\n‏-‏	غياب أدوات المتابعة والتحليل: باستخدام وسائل التواصل التقليدية، يصبح من الصعب ‏تتبع إحصائيات المشاريع ونسبة الإنجاز وعدد المشاريع المكتملة. كما لا توجد واجهة ‏لمواعيد المناقشات أو نظام لتقديم تقارير رضا الطلاب والمشرفين، مما يؤثر على تقييم ‏العملية التعليمية بصورة شاملة.‏\n\n‏-‏	التحديات في إدارة فرق العمل وتوزيع المهام: يواجه قائد الفريق صعوبة في توزيع المهام ‏وجدولة الاجتماعات بشكل منظم مع المشرفين. ‏\n\n‏-‏	غياب مكتبة موارد منظمة: الطلاب يحتاجون لمكتبة تتضمن مراجع وأدوات علمية تدعم ‏مشاريعهم، مع ميزة البحث السريع عن المعلومات. كما يفتقرون إلى مرونة الوصول لموارد ‏معرفية منسقة، حيث أن الاعتماد على التواصل التقليدي لا يوفر تلك الإمكانية.‏\n\n\n‏-‏	ضعف الخصوصية والتنظيم في الوصول إلى المشاريع: تعاني الفرق من عدم وجود إعدادات ‏خصوصية كافية أو مرونة للوصول إلى مشاريعهم بطريقة متقدمة، وهذا يؤثر على سرية ‏وخصوصية المشاريع. ‏\n\n‏-‏	عدم وجود دعم وإرشاد من الأكاديميين وذوي الخبرة والطلاب السابقين: يفتقر النظام ‏التقليدي إلى وسيلة لربط الطلاب الحاليين بالأكاديميين والطلاب السابقين للاستفادة من ‏خبراتهم، مما يُحرم الطلاب من تبادل الخبرات وتعزيز بيئة أكاديمية مساندة.‏\n\n‏-‏	التحديات التي يواجهها الطلاب عند تشكيل فرق عمل مناسبة. يفتقر الطلاب عادة إلى ‏المعرفة الكافية بمستويات المهارات المختلفة لزملائهم وقدراتهم في مجالات محددة، مما قد ‏يؤدي إلى تشكيل فرق غير متجانسة أو تفتقر للتكامل في الخبرات‎.‎\n\n\nإن تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل ‏المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.‏', 'mindmaps/cBmzSpBSAjHnodcIMOvzomG6QYdDqNirt3CPWzhl.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة موارد تدعم تنفيذ المشاريع وتخصيص إعدادات خصوصية لكل ‏فريق، مما يعزز من سرية المشاريع. كما يتيح التواصل بين الطلاب الجدد والطلاب السابقين لتبادل ‏الخبرات، متجاوزاً الاعتماد على التواصل غير الرسمي ويقدم تجربة أكاديمية منظمة وفعالة‎. ‎‏ كما ‏يشمل النظام المقترح نظام توصية لمساعدة الطلاب في اختيار فرقهم حيث يقدم اقتراحات لأعضاء ‏الفريق بناءً على المهارات والتخصصات واهتمامات المشروع، مما يسهم في تشكيل فرق متوازنة ‏وفعّالة ويعزز من فرص نجاح المشاريع الأكاديمية', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم كل مرحلة من المشرف مع إمكانية إضافة ملاحظات للطلاب‏\n‏8. لوحة تحكم تحوي إحصائيات ورسومات بيانية توضح عدد المشاريع والمشاريع المكتملة ونسبة ‏الإنجاز\n‏9. إشعارات تنبيهية‏\n‏10. واجهة لمواعيد المناقشات المرحلية والنهائية‏\n‏11. تقارير عن رضا الطلاب والمشرفين‏\n‏12. اتاحة لقائد الفريق ميزة توزيع المهام‏\n‏13. نظام رسائل\n‏14. إتاحة لقائد الفريق جدولة الاجتماعات مع المشرفين‏\n‏15. لوحة شرف‏\n‏16. واجهة لعرض المشاريع المميزة‏\n‏17. تقييم الطلاب لبعضهم بطريقة سرية ومعايير محددة‏\n‏18. إدارة عمليات موافقة إلكترونية على الانتقال بين مراحل المشروع‏\n‏19. نظام توصية لمساعدة الطلاب في العثور على أعضاء فرق مناسبين\n‏20. مكتبة تحتوي على أدوات ومراجع ومقالات مع ميزة بحث\n‏21. تمكين منسق المشاريع من إدارة المكتبة‏\n‏22. إعدادات خصوصية ومرونة في الوصول لمشروع كل فريق‏\n‏23. السماح للطلاب السابقين بإرشاد الطلاب الحاليين‏\n‏24. مساحة للبحث عن شركاء مشاريع‏', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-14 09:06:49', '2025-04-14 09:06:49'),
(12, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة , مما يجعل مراقبة التزام الفرق ‏بالخطة الزمنية أمرا  صعبا .‏\nكذلك يؤدي غياب منصة موحدة للتواصل إلى صعوبات في تنظيم المناقشات وتوززيع المهام بين ‏أعضاء الفريق والمشرفين .‏\nيضاف إلى ذلك نقص الموارد التعليمية المتاحة , مما يعوق وصول الطلاب إلى الأدوات والمراجع ‏اللازمة.‏\nكما توجد حاجة إلى نظام لتقييم الأعضاء سريا , وآلية  إدارية للموافقات الإلكترونية , مع إرشاد من ‏الأكاديميين وذوي الخبرة و الطلاب السابقين لتوجيه الطلاب الجدد.‏\nكما أن غياب أداة توصية يمكن أن يُعيق الفرق في اختيار الأعضاء الملائمين، حيث يمكن لنظام ‏التوصية دعم الطلاب باقتراح زملاء لديهم المهارات المناسبة للانضمام إلى مشاريعهم.‏', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم. هذه الطرق تفتقر ‏إلى الكثير من الخصائص التي تتيح الإدارة الفعالة والمنهجية للمشاريع، وهو ما يسبب العديد من ‏المشكلات، منها:‏\n\n‏-‏	صعوبة تنظيم المراحل الزمنية للمشاريع: تعاني الجامعة من عدم وجود تقسيم منظم ‏لمراحل المشاريع مع مواعيد نهائية واضحة، مما يجعل المتابعة والتقييم الدوري أصعب. ‏كما أن غياب التنبيهات الرقمية يؤدي إلى التأخر في تسليم المراحل بسبب الاعتماد على ‏التواصل الفردي والواقعي، وهذا يؤثر على تقدم المشاريع.‏\n‏-‏	غياب أدوات المتابعة والتحليل: باستخدام وسائل التواصل التقليدية، يصبح من الصعب ‏تتبع إحصائيات المشاريع ونسبة الإنجاز وعدد المشاريع المكتملة. كما لا توجد واجهة ‏لمواعيد المناقشات أو نظام لتقديم تقارير رضا الطلاب والمشرفين، مما يؤثر على تقييم ‏العملية التعليمية بصورة شاملة.‏\n\n‏-‏	التحديات في إدارة فرق العمل وتوزيع المهام: يواجه قائد الفريق صعوبة في توزيع المهام ‏وجدولة الاجتماعات بشكل منظم مع المشرفين. ‏\n\n‏-‏	غياب مكتبة موارد منظمة: الطلاب يحتاجون لمكتبة تتضمن مراجع وأدوات علمية تدعم ‏مشاريعهم، مع ميزة البحث السريع عن المعلومات. كما يفتقرون إلى مرونة الوصول لموارد ‏معرفية منسقة، حيث أن الاعتماد على التواصل التقليدي لا يوفر تلك الإمكانية.‏\n\n\n‏-‏	ضعف الخصوصية والتنظيم في الوصول إلى المشاريع: تعاني الفرق من عدم وجود إعدادات ‏خصوصية كافية أو مرونة للوصول إلى مشاريعهم بطريقة متقدمة، وهذا يؤثر على سرية ‏وخصوصية المشاريع. ‏\n\n‏-‏	عدم وجود دعم وإرشاد من الأكاديميين وذوي الخبرة والطلاب السابقين: يفتقر النظام ‏التقليدي إلى وسيلة لربط الطلاب الحاليين بالأكاديميين والطلاب السابقين للاستفادة من ‏خبراتهم، مما يُحرم الطلاب من تبادل الخبرات وتعزيز بيئة أكاديمية مساندة.‏\n\n‏-‏	التحديات التي يواجهها الطلاب عند تشكيل فرق عمل مناسبة. يفتقر الطلاب عادة إلى ‏المعرفة الكافية بمستويات المهارات المختلفة لزملائهم وقدراتهم في مجالات محددة، مما قد ‏يؤدي إلى تشكيل فرق غير متجانسة أو تفتقر للتكامل في الخبرات‎.‎\n\n\nإن تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل ‏المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.‏', 'mindmaps/hos4kETXq1OQ3ovxHHEBN6csKvmNWYwRS5STkgCm.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة موارد تدعم تنفيذ المشاريع وتخصيص إعدادات خصوصية لكل ‏فريق، مما يعزز من سرية المشاريع. كما يتيح التواصل بين الطلاب الجدد والطلاب السابقين لتبادل ‏الخبرات، متجاوزاً الاعتماد على التواصل غير الرسمي ويقدم تجربة أكاديمية منظمة وفعالة‎. ‎‏ كما ‏يشمل النظام المقترح نظام توصية لمساعدة الطلاب في اختيار فرقهم حيث يقدم اقتراحات لأعضاء ‏الفريق بناءً على المهارات والتخصصات واهتمامات المشروع، مما يسهم في تشكيل فرق متوازنة ‏وفعّالة ويعزز من فرص نجاح المشاريع الأكاديمية', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم كل مرحلة من المشرف مع إمكانية إضافة ملاحظات للطلاب‏\n‏8. لوحة تحكم تحوي إحصائيات ورسومات بيانية توضح عدد المشاريع والمشاريع المكتملة ونسبة ‏الإنجاز\n‏9. إشعارات تنبيهية‏\n‏10. واجهة لمواعيد المناقشات المرحلية والنهائية‏\n‏11. تقارير عن رضا الطلاب والمشرفين‏\n‏12. اتاحة لقائد الفريق ميزة توزيع المهام‏\n‏13. نظام رسائل\n‏14. إتاحة لقائد الفريق جدولة الاجتماعات مع المشرفين‏\n‏15. لوحة شرف‏\n‏16. واجهة لعرض المشاريع المميزة‏\n‏17. تقييم الطلاب لبعضهم بطريقة سرية ومعايير محددة‏\n‏18. إدارة عمليات موافقة إلكترونية على الانتقال بين مراحل المشروع‏\n‏19. نظام توصية لمساعدة الطلاب في العثور على أعضاء فرق مناسبين\n‏20. مكتبة تحتوي على أدوات ومراجع ومقالات مع ميزة بحث\n‏21. تمكين منسق المشاريع من إدارة المكتبة‏\n‏22. إعدادات خصوصية ومرونة في الوصول لمشروع كل فريق‏\n‏23. السماح للطلاب السابقين بإرشاد الطلاب الحاليين‏\n‏24. مساحة للبحث عن شركاء مشاريع‏', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-14 09:07:24', '2025-04-14 09:07:24'),
(13, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير المهارات البحثية .\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .\nأحد التحديات ه...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام،...', 'mindmaps/n0Zto0STtxrCM9N8jaXiR2Io763Y9rDy7w4NJh8w.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع المتميزة. يشمل النظام مكتبة مو...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '. إنشاء حساب\n2. تسجيل دخول\n3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية\n4. تخصيص صلاحيات لكل نوع حساب\n5. تقسيم المشروع لمراحل متعددة\n6. تحديد مواعيد نهائية لكل مرحلة من المشرف\n7. تقييم كل مرحلة من ا...', '١. الأمن والحماية \n٢.واجهات سهلة الاستخدام', '2025-04-14 09:52:58', '2025-04-14 09:52:58'),
(14, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/zhtpJtGO3QyckgFEikcYN8W2UwfrmwDEWTYU1tvE.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-14 10:53:26', '2025-04-14 10:53:26'),
(15, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/eHrMMyVfKSqJUDuQxuMq00o9OCwKe9wiKlanxTJQ.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-15 02:50:20', '2025-04-15 02:50:20'),
(16, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/vtt4yNZu3etn5idaoEb3eqMIK8yiAtB8yyEdhuVg.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-15 02:52:45', '2025-04-15 02:52:45'),
(17, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/IUxAMZtTEc2tXUOlqapAq3CLjR179BO7evqKb75t.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-19 15:49:38', '2025-04-19 15:49:38'),
(18, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/UioG4fy5oc2LOoYvs0j7R6BEdckRpSwTUeDVzZLF.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-19 16:09:08', '2025-04-19 16:09:08'),
(19, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبر...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل...', 'mindmaps/t9x429jvffnEIVFflJHHrFgPwu31uICHPxzGwROg.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع ا...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-19 16:15:01', '2025-04-19 16:15:01'),
(20, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبر...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل...', 'mindmaps/zdApcQA9Sv2rLBOUrEDMYt8STgSagNAy3DNavNrH.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع ا...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-19 16:44:11', '2025-04-19 16:44:11'),
(21, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبر...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل...', 'mindmaps/a41oBwgn97TKu7R8mY2nbqbXNBBNQJuAS7zGa9j6.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع ا...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-19 16:49:04', '2025-04-19 16:49:04'),
(22, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبر...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل...', 'mindmaps/Ix3UoL7JkqF1PdiLL8WVHMpeKqhIYTMtVxerUFy2.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع ا...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-19 16:54:38', '2025-04-19 16:54:38'),
(23, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبر...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل...', 'mindmaps/sSe6jFzzU6sy0sAjPBi9Osdf2HztbfFxqIeMUXco.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع ا...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-19 16:57:33', '2025-04-19 16:57:33'),
(24, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبر...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل...', 'mindmaps/vBLmWuuJkVvWOfwC7AusYTOnpkWkaBdKs0ydAA5j.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع ا...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-20 01:09:22', '2025-04-20 01:09:22'),
(25, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبر...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل...', 'mindmaps/Qa31b4UEcKxB13wk1PxOP7HFRngl8mw0UwOKzzii.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع ا...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-20 02:28:59', '2025-04-20 02:28:59'),
(26, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبر...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل...', 'mindmaps/EXGEvmOfEmTlW1a2Ny8TQbeSqQ91ZtZhQdpvDP88.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع ا...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-20 03:10:26', '2025-04-20 03:10:26'),
(27, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة , مما يجعل مراقبة التزام الفرق ‏بالخطة الزمنية أمرا  صعبا .‏\nكذلك يؤدي غياب منصة موحدة للتواصل إلى صعوبات في تنظيم المناقشات وتوززيع المهام بين ‏أعضاء الفريق والمشرفين .‏\nيضاف إلى ذلك نقص الموارد التعليمية المتاحة , مما يعوق وصول الطلاب إلى الأدوات والمراجع ‏اللازمة.‏\nكما توجد حاجة إلى نظام لتقييم الأعضاء سريا , وآلية  إدارية للموافقات الإلكترونية , مع إرشاد من ‏الأكاديميين وذوي الخبرة و الطلاب السابقين لتوجيه الطلاب الجدد.‏\nكما أن غياب أداة توصية يمكن أن يُعيق الفرق في اختيار الأعضاء الملائمين، حيث يمكن لنظام ‏التوصية دعم الطلاب باقتراح زملاء لديهم المهارات المناسبة للانضمام إلى مشاريعهم.‏', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم. هذه الطرق تفتقر ‏إلى الكثير من الخصائص التي تتيح الإدارة الفعالة والمنهجية للمشاريع، وهو ما يسبب العديد من ‏المشكلات، منها:‏\n\n‏-‏	صعوبة تنظيم المراحل الزمنية للمشاريع: تعاني الجامعة من عدم وجود تقسيم منظم ‏لمراحل المشاريع مع مواعيد نهائية واضحة، مما يجعل المتابعة والتقييم الدوري أصعب. ‏كما أن غياب التنبيهات الرقمية يؤدي إلى التأخر في تسليم المراحل بسبب الاعتماد على ‏التواصل الفردي والواقعي، وهذا يؤثر على تقدم المشاريع.‏\n‏-‏	غياب أدوات المتابعة والتحليل: باستخدام وسائل التواصل التقليدية، يصبح من الصعب ‏تتبع إحصائيات المشاريع ونسبة الإنجاز وعدد المشاريع المكتملة.', 'mindmaps/FZQtasvLrDUp5pt1bMpE2fNJg2d6cWAZ0QzLCmxx.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة موارد تدعم تنفيذ المشاريع وتخصيص إعدادات خصوصية لكل ‏فريق، مما يعزز من سرية المشاريع.', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3.', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-20 06:10:55', '2025-04-20 06:10:55'),
(28, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدا...', 'mindmaps/YL5fuKEqpkAFhSSu1tjflKcnCn3j7tdscf9xUfF1.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة موارد تدعم تنفيذ المشاريع وتخصيص إعدادات خصوصية لك...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم كل مرحلة من المشرف مع إمكانية إضافة ملاحظات للطلاب...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-20 09:55:26', '2025-04-20 09:55:26'),
(29, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدا...', 'mindmaps/mmbrTRNtS0bQn1Ip0TEsu1GFgu9XTi7wM6MwoWb1.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة موارد تدعم تنفيذ المشاريع وتخصيص إعدادات خصوصية لك...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم كل مرحلة من المشرف مع إمكانية إضافة ملاحظات للطلاب...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام لهجلا بيغاب أبائ قدقاكف عليه إن الىبر شعد التعادر الع', '2025-04-20 10:01:54', '2025-04-20 10:01:54'),
(30, NULL, 'مشروع نظام إدارة المقترحات', '.', '.                  .', 'mindmaps/r5c7lUInDL1u3wf86yA15SzyFF2qX4LER7JRyOrD.png', '.', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم كل مرحلة من المشرف مع إمكانية إضافة ملاحظات للطلاب...', '.', '2025-04-20 11:20:28', '2025-04-20 11:20:28'),
(31, NULL, 'مشروع نظام إدارة المقترحات', '.', '.                  .', 'mindmaps/rTjHeR2A6SvwNqHOU2fqxLcisn0BYkg8EYVkiNb4.png', '.', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '.', '.', '2025-04-20 11:24:28', '2025-04-20 11:24:28'),
(32, NULL, 'مشروع نظام إدارة المقترحات', '.', '.                  .', 'mindmaps/bglb35qPXPUmNsIiZi3XBlXLuY3WolVkkHRaMEPa.png', '.', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '.', '.', '2025-04-20 11:30:06', '2025-04-20 11:30:06'),
(33, NULL, 'مشروع نظام إدارة المقترحات', ',     .         -            –   : a saxophonic tyrannical gynecological et al.', ': -   –    — ,                 ., () i.e., and if a person is not able to re-enter the e-mail address, it’s not possible to send an email to', 'mindmaps/KvzEhbOBY8FaYLn9rJfq1Pfi4SN4uCHEZyIjUalH.png', '–  -     :          —      . , ,,  и наалноо расолоне уаи в не друение.', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '21.       2..  3.     –  :  -  a liar.', ':...        -    .', '2025-04-20 13:17:57', '2025-04-20 13:17:57'),
(34, NULL, 'مشروع نظام إدارة المقترحات', '<extra_id_0> للطلاب الجدد . كما يؤدي غياب منصة لتقييم الأعضاء على الفرق. <extra_id_34>', '<extra_id_0> على المشاريع التي تقدمها الجامعة، كما يواجه الكثير من المشكلات، منها:', 'mindmaps/z1xKAKdEPJ35psKyryebGckKf15KLzWzxsduJKt5.png', '<extra_id_0> . <extra_id_11> ، كما يقدم نظام توصية لمساعدة الطلاب في اختيار فرقهم.', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '<extra_id_0> مناسبة .. <extra_id_27> عدد المشاريع والمشاريع الموجودة في المشروع -. <extra_id_10> مجانا!.', '<extra_id_0> سهلة استخدام مناسبة لاستخدام التطبيقات الخاصة بهم. <extra_id_36> عالية الاعتماد على الطلبات', '2025-04-20 15:07:20', '2025-04-20 15:07:20'),
(35, NULL, 'مشروع نظام إدارة المقترحات', '<extra_id_0> للطلاب الجدد . وهكذا يمكننا الاستفادة منها كثيراً.', '<extra_id_0> لإدارة المشاريع، وهذا يؤدي إلى التأخر في تقديم التقارير.', 'mindmaps/ExbWlainmF3Q5WcGCPLpBCK7VuACkUuKE3xQCBmv.png', '<extra_id_0> المناسبة . <extra_id_10> . مجاناً! <extra_id_8>... <extra_id_49> على النحو التالي: [email protected]', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '<extra_id_0> المشاريع الصغيرة والمتوسطة . <extra_id_10>  <extra_id_11> مجانا! <extra_id_49> مناسبة للطلاب السابقين', '<extra_id_0>.) <extra_id_34>: ١٢ واجهات سهلة الاستخدام ٢٦ واجهة سهلة للاستخدام ٢٧', '2025-04-20 15:13:53', '2025-04-20 15:13:53'),
(36, NULL, 'مشروع نظام إدارة المقترحات', '<extra_id_0> للطلاب الجدد . كما يمكن أن يكون هناك حاجة إلى نظام لتقييم الأعضاء', '<extra_id_0> على المشاريع التي تقدم مشاريعهم، كما يواجه الكثير من المشكلات، منها: -', 'mindmaps/5RnHSqvAzgjkKYSJli7t0PB9zm9kx3acYnkzO8sb.png', '<extra_id_0> النظام المقترح نظام توصية لمساعدة الطلاب في اختيار فرقهم ..بوتية.равится', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '<extra_id_0> مناسبة للعمل على المشاريع المميزة .. <extra_id_10> مجاناً.!! <extra_id_24> !. <extra_id_49> عرض', '<extra_id_0> على اللغة العربية. .بوتاسيات عربية.dgå..🅐. <extra_id_51> كاملة ً. <extra_id_41>', '2025-04-20 15:18:34', '2025-04-20 15:18:34'),
(37, NULL, 'مشروع نظام إدارة المقترحات', '<extra_id_0> الفرق .. <extra_id_12>. كتب : محمد محمود , عدد المشاهدات: (( ) <extra_id_56>.', '<extra_id_0> .. <extra_id_10>. - صعوبة تنظيم المراحل الزمنية للمشاريع: البحث حول هذه الطرق.', 'mindmaps/BT8K0nIqu5S0cJRw4rLeWv7UX5qTNQbamDkRD0yr.png', '<extra_id_0> المناسبة لذلك. <extra_id_10>  <extra_id_11> ..معدل: تحميل المزيد من المعلومات. قراءة الجمل', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '<extra_id_0> كاملة على البحث عن شركاء مشاريع أخرى. النص: . إنشاء حساب 2. تسجيل حساب', '<extra_id_0> .. <extra_id_27> النص كامل: <extra_id_49> أخرى يمكن الاطلاع على ملخص دقيق يمكنك قراءته.', '2025-04-20 15:22:43', '2025-04-20 15:22:43'),
(38, NULL, 'مشروع نظام إدارة المقترحات', '<extra_id_0> على النقاط التالية. النص: يمكن أن يكون كافيا لفهم الفكرة العامة دون الرجوع إليها.', '<extra_id_0> المناسبة لإدارة المشاريع .. <extra_id_10> مجاناً :. <extra_id_28> !. <extra_id_52> على الطريقة. - صعوبة تنظيم المراحل', 'mindmaps/hrDIpxvAwuKtGUOA9mgbDCOJa8ifHsREmpunWWoT.png', '<extra_id_0> المناسبة .. <extra_id_12> مجاناً :. ). (م.) <extra_id_52> النص التالي: <extra_id_35>.م', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '<extra_id_0> لتقييم المشاريع المميزة . <extra_id_10>  <extra_id_11> ! <extra_id_55> على النص التالي: <extra_id_43> المزيد من النقاط', '<extra_id_0> النص التالي. <extra_id_10>  <extra_id_11> على هذه الفكرة العامة. - موقع الموقع : الإمارات العربية المتحدة.', '2025-04-20 15:27:26', '2025-04-20 15:27:26'),
(39, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/pQn5gXKa4tQNhty2CzSSEkNrwXj5WXMoXsA5KEbu.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-20 15:31:17', '2025-04-20 15:31:17');
INSERT INTO `project_proposals` (`proposalId`, `group_id`, `title`, `problem_statement`, `problem_background`, `problem_mindmap_path`, `proposed_solution`, `methodology`, `technology_stack`, `functional_requirements`, `non_functional_requirements`, `created_at`, `updated_at`) VALUES
(40, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/Vsiuq0f32YKqeX8MKwt0Rocgv9kbF1WbV4U8lJSS.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-20 15:33:07', '2025-04-20 15:33:07'),
(41, NULL, 'مشروع نظام إدارة المقترحات', '<extra_id_0> الفرق . كما يمكن أن يكون هناك حاجة إلى نظام لتقييم الأعضاء. <extra_id_10>', '<extra_id_0> على المشاريع التي تقدم مشاريعهم، كما يواجه الكثير من المشكلات، منها: -', 'mindmaps/EcKw96qQwocxjoHt2OZoebmOWCM9V8NHAd8yPD2g.png', '<extra_id_0> النظام المقترح نظام توصية لمساعدة الطلاب والمشاركين في اختيار فرقهم. .;\">', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '<extra_id_0> اختيارية لتقييم المشاريع والمشاريع التي تقدمها الفريق .. <extra_id_10> مجال البحث -', '<extra_id_0> ..) <extra_id_34> لذلك فهي واجهات سهلة الاستخدام، كما هو الحال في هذه الظاهرة', '2025-04-20 15:35:48', '2025-04-20 15:35:48'),
(42, NULL, 'مشروع نظام إدارة المقترحات', '<extra_id_0> الفرق. النص: يمكن أن يكون التلخيص واضحًا ودقيقا .. <extra_id_10>. مجانا.', '<extra_id_0> النص: النطاق. - صعوبة تنظيم المراحل الزمنية للمشاريع لإدارة المشاريع.', 'mindmaps/jRuCSZc9srX2KI85Wui7M1bWewDTWKn6Gw3q9u8a.png', '<extra_id_0> . <extra_id_11>. النص: نظام توصية لمساعدة الطلاب في اختيار المشاريع الأكاديمية..', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '<extra_id_0> على المشروع. النص: . إنشاء حساب 2. تسجيل دخول 3. اختيار طريقة لعرض المشاريع', '<extra_id_0> على المشروع الأكاديمي. النص: ١. الأمن والحماية . <extra_id_27>.. <extra_id_8>. <extra_id_52> دقيقًا.', '2025-04-20 15:46:20', '2025-04-20 15:46:20'),
(43, NULL, 'مشروع نظام إدارة المقترحات', '<extra_id_0> الفرق .. النص: يمكن أن يكون هناك حاجة إلى نظام توصية.', '<extra_id_0> الجامعة. النص: البحث حول التلخيص الآتي: - التحديات في إدارة المشاريع.', 'mindmaps/yRZNrDenVvT1lcun9T7VAZYTqVfoXJxJRu6PqYHl.png', '<extra_id_0> . <extra_id_11>. النص: نظام توصية لمساعدة الطلاب في اختيار المشاريع الأكاديمية..', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '<extra_id_0> على المشروع. النص: . إنشاء حساب 2. تسجيل دخول 3. عرض المشاريع المميزة.', '<extra_id_0> النص: ١. واجهات سهلة الاستخدام - تعلم اللغة العربية كاملة جميع الحقوق محفوظة', '2025-04-20 15:51:35', '2025-04-20 15:51:35'),
(44, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/GxlQ1SkpmxylFVMhP4QAEcTCoNRBCdwyPHGu5kYB.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-21 04:31:44', '2025-04-21 04:31:44'),
(45, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستد...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد ...', 'mindmaps/kZt3kUbX9hu2XH362U02IttAMs8OZ8Kp9PXpVMs2.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع ا...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. ت...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-21 05:06:54', '2025-04-21 05:06:54'),
(46, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستد...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد ...', 'mindmaps/p8BSo5oKs1fk4McpSQourtoh5BdmD6gToasWREsj.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع ا...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. ت...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-21 05:14:50', '2025-04-21 05:14:50'),
(47, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/gta3k7lwo3qKLcwCmsFs6wbLDuOawQhNQj1QGtWq.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-21 05:36:23', '2025-04-21 05:36:23'),
(48, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/GFKM6btWJgoTohDoRgU9NKPOs0OkjVAby4P7e8zm.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-21 05:44:05', '2025-04-21 05:44:05'),
(49, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/WnJpvTpADLJcTwCVcaCif6zSH9q2kBxuF9hhNnot.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع ا...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-21 06:14:31', '2025-04-21 06:14:31'),
(50, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/OjUqTR2yPQpEvHUG1NXUk0G99JhI1Q9924P4IMOl.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-21 06:34:53', '2025-04-21 06:34:53'),
(51, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/KnL0E2pZBoANnNui9Tj1eSIoaURfUxWKcxx7gYqQ.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-21 07:18:38', '2025-04-21 07:18:38'),
(52, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/vP7NrU8nrLGvAV7wOXt564iw6XLm6mses5EHZ3al.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-21 07:42:45', '2025-04-21 07:42:45'),
(53, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديا...', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام...', 'mindmaps/3onFJdn0ufHgcpuVFwkOOXEljV5k50PhjB2dHgmt.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة...', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم...', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-21 07:54:18', '2025-04-21 07:54:18'),
(54, NULL, 'مشروع نظام إدارة المقترحات', '', '', 'mindmaps/rkfGYnz1IzVLW1Wt3hkSnLyFD9kKizLI0530LXA5.png', '', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '', '', '2025-04-21 08:14:57', '2025-04-21 08:14:57'),
(55, NULL, 'مشروع نظام إدارة المقترحات', '', '', 'mindmaps/Ebz5Q2Q9WQCtXylE7Bjkm5NYSc7C1oyzuzxJq0Kg.png', '', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '', '', '2025-04-21 08:36:09', '2025-04-21 08:36:09'),
(56, NULL, 'مشروع نظام إدارة المقترحات', '', '', 'mindmaps/xPDsEcLG6yxtXDSDI43k2tVdBARO59bAatEQ06z7.png', '', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '', '', '2025-04-21 09:10:08', '2025-04-21 09:10:08'),
(57, NULL, 'مشروع نظام إدارة المقترحات', '', '', 'mindmaps/ffYrBzObHfLiqOrZmMp5i6VFgCOu4rYrURebpnDs.png', '', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '', '', '2025-04-21 10:12:30', '2025-04-21 10:12:30'),
(58, NULL, 'مشروع نظام إدارة المقترحات', '', 'The focus of this research project is to establish a single platform for managing academic programs in the Sharjah Academic Center, but it lacks an electronic management system. Instead, the university relies solely on manual communication channels such as email and chat apps like WhatsApp, Telegram, and WeChat.', 'mindmaps/KauNpBHgHnb5CYI59Z43TqnLKncCWJU0l2vAZWxa.png', '[Translated into English with modifications for clarity and brevity.]\n\nAn Academic Management System (AMS) at the University of Sharjah, dedicated to providing comprehensive software tools to students and researchers, aims to enhance their study processes by offering a wide range of interactive software applications tailored to various time periods. These software applications are designed to assist students in mastering complex academic knowledge, while also enhancing their research skills.\n\nIn summary, this AMS is focused on facilitating student and faculty participation in the completion of academic assignments within a specific timeframe, and providing them with tools to help them perform their tasks effectively.', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '', '', '2025-04-21 11:23:14', '2025-04-21 11:23:14'),
(59, NULL, 'مشروع نظام إدارة المقترحات', '', '', 'mindmaps/VVQuHESFoPbMjFHj7Z0MvJQld5HPLx3tXnD0TZik.png', '', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '', '', '2025-04-21 12:03:20', '2025-04-21 12:03:20'),
(60, NULL, 'مشروع نظام إدارة المقترحات', 'خطأ أثناء الاتصال بـ OpenAI', 'خطأ أثناء الاتصال بـ OpenAI', 'mindmaps/e77IsxDeO5jk84I7pNXi0F9taDRB1ef24Vb82Ilx.png', 'خطأ أثناء الاتصال بـ OpenAI', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', 'خطأ أثناء الاتصال بـ OpenAI', 'خطأ أثناء الاتصال بـ OpenAI', '2025-04-22 05:47:55', '2025-04-22 05:47:55'),
(61, NULL, 'مشروع نظام إدارة المقترحات', 'خطأ أثناء الاتصال بـ OpenAI', 'خطأ أثناء الاتصال بـ OpenAI', 'mindmaps/l6JZ3RbO65OXnDsxVrPGsah5SmKyvMyompscLAIJ.png', 'خطأ أثناء الاتصال بـ OpenAI', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', 'خطأ أثناء الاتصال بـ OpenAI', 'خطأ أثناء الاتصال بـ OpenAI', '2025-04-22 05:52:54', '2025-04-22 05:52:54'),
(62, NULL, 'مشروع نظام إدارة المقترحات', '', '', 'mindmaps/qRfDmUNFyMdgyKppMy1T99cdgc1OV7qp68z6bwZR.png', '', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '', '', '2025-04-22 06:41:33', '2025-04-22 06:41:33'),
(63, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية ‏', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام، ‏', 'mindmaps/MI8JUzZQz6YAbk2fPcXEsoOpJB8YwBijnt9K11Ie.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم كل مرحلة من المشرف مع إمكانية إضافة ملاحظات للطلاب‏\n‏8. لوحة تحكم تحوي إحصائيات ورسومات بيانية توضح عدد المشاريع والمشاريع المكتملة ونسبة ‏الإنجاز\n‏9. إشعارات تنبيهية‏\n‏10. واجهة لمواعيد المناقشات المرحلية والنهائية‏\n‏11. تقارير عن رضا الطلاب والمشرفين‏\n‏12. اتاحة لقائد الفريق ميزة توزيع المهام‏\n‏13. نظام رسائل\n‏14. إتاحة لقائد الفريق جدولة الاجتماعات مع المشرفين‏\n‏15. لوحة شرف‏\n‏16. واجهة لعرض المشاريع المميزة‏\n‏17. تقييم الطلاب لبعضهم بطريقة سرية ومعايير محددة‏\n‏18. إدارة عمليات موافقة إلكترونية على الانتقال بين مراحل المشروع‏\n‏19. نظام توصية لمساعدة الطلاب في العثور على أعضاء فرق مناسبين\n‏20. مكتبة تحتوي على أدوات ومراجع ومقالات مع ميزة بحث\n‏21. تمكين منسق المشاريع من إدارة المكتبة‏\n‏22. إعدادات خصوصية ومرونة في الوصول لمشروع كل فريق‏\n‏23. السماح للطلاب السابقين بإرشاد الطلاب الحاليين‏\n‏24. مساحة للبحث عن شركاء مشاريع‏', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-04-22 07:51:07', '2025-04-22 07:51:07'),
(64, NULL, 'مشروع نظام إدارة المقترحات', 'تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير ‏المهارات البحثية .‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏\nأحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة , مما يجعل مراقبة التزام الفرق ‏بالخطة الزمنية أمرا  صعبا .‏\nكذلك يؤدي غياب منصة موحدة للتواصل إلى صعوبات في تنظيم المناقشات وتوززيع المهام بين ‏أعضاء الفريق والمشرفين .‏\nيضاف إلى ذلك نقص الموارد التعليمية المتاحة , مما يعوق وصول الطلاب إلى الأدوات والمراجع ‏اللازمة.‏\nكما توجد حاجة إلى نظام لتقييم الأعضاء سريا , وآلية  إدارية للموافقات الإلكترونية , مع إرشاد من ‏الأكاديميين وذوي الخبرة و الطلاب السابقين لتوجيه الطلاب الجدد.‏\nكما أن غياب أداة توصية يمكن أن يُعيق الفرق في اختيار الأعضاء الملائمين، حيث يمكن لنظام ‏التوصية دعم الطلاب باقتراح زملاء لديهم المهارات المناسبة للانضمام إلى مشاريعهم.‏\nلكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة .‏', 'النطاق\nمن خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن ‏الجامعة لا تملك نظاماً إلكترونياً لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل ‏واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم. هذه الطرق تفتقر ‏إلى الكثير من الخصائص التي تتيح الإدارة الفعالة والمنهجية للمشاريع، وهو ما يسبب العديد من ‏المشكلات، منها:‏\n\n‏-‏	صعوبة تنظيم المراحل الزمنية للمشاريع: تعاني الجامعة من عدم وجود تقسيم منظم ‏لمراحل المشاريع مع مواعيد نهائية واضحة، مما يجعل المتابعة والتقييم الدوري أصعب. ‏كما أن غياب التنبيهات الرقمية يؤدي إلى التأخر في تسليم المراحل بسبب الاعتماد على ‏التواصل الفردي والواقعي، وهذا يؤثر على تقدم المشاريع.‏\n‏-‏	غياب أدوات المتابعة والتحليل: باستخدام وسائل التواصل التقليدية، يصبح من الصعب ‏تتبع إحصائيات المشاريع ونسبة الإنجاز وعدد المشاريع المكتملة. كما لا توجد واجهة ‏لمواعيد المناقشات أو نظام لتقديم تقارير رضا الطلاب والمشرفين، مما يؤثر على تقييم ‏العملية التعليمية بصورة شاملة.‏\n\n‏-‏	التحديات في إدارة فرق العمل وتوزيع المهام: يواجه قائد الفريق صعوبة في توزيع المهام ‏وجدولة الاجتماعات بشكل منظم مع المشرفين. ‏\n\n‏-‏	غياب مكتبة موارد منظمة: الطلاب يحتاجون لمكتبة تتضمن مراجع وأدوات علمية تدعم ‏مشاريعهم، مع ميزة البحث السريع عن المعلومات. كما يفتقرون إلى مرونة الوصول لموارد ‏معرفية منسقة، حيث أن الاعتماد على التواصل التقليدي لا يوفر تلك الإمكانية.‏\n\n\n‏-‏	ضعف الخصوصية والتنظيم في الوصول إلى المشاريع: تعاني الفرق من عدم وجود إعدادات ‏خصوصية كافية أو مرونة للوصول إلى مشاريعهم بطريقة متقدمة، وهذا يؤثر على سرية ‏وخصوصية المشاريع. ‏\n\n‏-‏	عدم وجود دعم وإرشاد من الأكاديميين وذوي الخبرة والطلاب السابقين: يفتقر النظام ‏التقليدي إلى وسيلة لربط الطلاب الحاليين بالأكاديميين والطلاب السابقين للاستفادة من ‏خبراتهم، مما يُحرم الطلاب من تبادل الخبرات وتعزيز بيئة أكاديمية مساندة.‏\n\n‏-‏	التحديات التي يواجهها الطلاب عند تشكيل فرق عمل مناسبة. يفتقر الطلاب عادة إلى ‏المعرفة الكافية بمستويات المهارات المختلفة لزملائهم وقدراتهم في مجالات محددة، مما قد ‏يؤدي إلى تشكيل فرق غير متجانسة أو تفتقر للتكامل في الخبرات‎.‎\n\n\nإن تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل ‏المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.‏', 'mindmaps/nqMgsh09f2JiyL9338HFpFXO8ia3sCusezKXjya3.png', 'نظام إدارة المشاريع الأكاديمية بجامعة الشام الخاصة، يهدف إلى توفير أدوات متكاملة تساعد ‏الطلاب والمشرفين في متابعة المراحل الزمنية، والتحليل، وتوزيع المهام، وعرض المشاريع ‏المتميزة. يشمل النظام مكتبة موارد تدعم تنفيذ المشاريع وتخصيص إعدادات خصوصية لكل ‏فريق، مما يعزز من سرية المشاريع. كما يتيح التواصل بين الطلاب الجدد والطلاب السابقين لتبادل ‏الخبرات، متجاوزاً الاعتماد على التواصل غير الرسمي ويقدم تجربة أكاديمية منظمة وفعالة‎. ‎‏ كما ‏يشمل النظام المقترح نظام توصية لمساعدة الطلاب في اختيار فرقهم حيث يقدم اقتراحات لأعضاء ‏الفريق بناءً على المهارات والتخصصات واهتمامات المشروع، مما يسهم في تشكيل فرق متوازنة ‏وفعّالة ويعزز من فرص نجاح المشاريع الأكاديمية‎.‎', 'Agile', '{\"Platform\": [\"Web\"], \"Databases\": [\"MySQL\"], \"Languages\": [\"PHP\"]}', '‏. إنشاء حساب‏\n‏2. تسجيل دخول‏\n‏3. إتاحة للمستخدم بتعديل معلومات حسابه الشخصية‏\n‏4. تخصيص صلاحيات لكل نوع حساب‏\n‏5. تقسيم المشروع لمراحل متعددة‏\n‏6. تحديد مواعيد نهائية لكل مرحلة من المشرف‏\n‏7. تقييم كل مرحلة من المشرف مع إمكانية إضافة ملاحظات للطلاب‏\n‏8. لوحة تحكم تحوي إحصائيات ورسومات بيانية توضح عدد المشاريع والمشاريع المكتملة ونسبة ‏الإنجاز\n‏9. إشعارات تنبيهية‏\n‏10. واجهة لمواعيد المناقشات المرحلية والنهائية‏\n‏11. تقارير عن رضا الطلاب والمشرفين‏\n‏12. اتاحة لقائد الفريق ميزة توزيع المهام‏\n‏13. نظام رسائل\n‏14. إتاحة لقائد الفريق جدولة الاجتماعات مع المشرفين‏\n‏15. لوحة شرف‏\n‏16. واجهة لعرض المشاريع المميزة‏\n‏17. تقييم الطلاب لبعضهم بطريقة سرية ومعايير محددة‏\n‏18. إدارة عمليات موافقة إلكترونية على الانتقال بين مراحل المشروع‏\n‏19. نظام توصية لمساعدة الطلاب في العثور على أعضاء فرق مناسبين\n‏20. مكتبة تحتوي على أدوات ومراجع ومقالات مع ميزة بحث\n‏21. تمكين منسق المشاريع من إدارة المكتبة‏\n‏22. إعدادات خصوصية ومرونة في الوصول لمشروع كل فريق‏\n‏23. السماح للطلاب السابقين بإرشاد الطلاب الحاليين‏\n‏24. مساحة للبحث عن شركاء مشاريع‏', '‏١. الأمن والحماية ‏\n‏٢.واجهات سهلة الاستخدام', '2025-05-01 08:14:29', '2025-05-01 08:14:29'),
(65, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تمثل المشاريع الأكاديمية جزءًا مهمًا من التعليم العالي، لكن تبرز العديد من التحديات التي تستدعي نظامًا لإدارة هذه المشاريع بكفاءة. أحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة، مما يجعل مراقبة التزام الفرق بالخطة الزمنية أمرًا صعبًا.', 'من خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظامًا إلكترونيًا لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم.', NULL, 'تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', '1. نظام لإدارة مراحل المشروع 2. أدوات لمتابعة التقدم 3. مكتبة موارد 4. نظام توصية لأعضاء الفريق', '1. واجهة سهلة الاستخدام 2. أداء عالي 3. أمان البيانات 4. توافق مع الأجهزة المختلفة', '2025-05-01 08:28:24', '2025-05-01 08:28:24'),
(66, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'يعد العمل في المشاريع الأكاديمية أمرا هاما بالنسبة للكثيرين.', 'أعلنت جامعة الشام السورية عن إنشاء شركة مشتركة مع جامعة الشام، تهدف إلى تطوير برامج علمية.', NULL, 'طورت جامعة جامعة سان فرانسيسكو الأمريكية نظاما إلكترونيا لإدارة المشاريع الأكاديمية.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', 'أعلن رئيس مجلس إدارة مؤسسة \"أوند\"، عبد المجيد عبد العزيز، عن مشروعه لمشروع مشروع مشروع مشروع مشروع مشروع مشروع مركز الإبداع الاقتصادي.', 'كشف عملاق الهواتف الذكية، أبل، النقاب عن هاتفه الذكي الجديد \"آيفون 5\"', '2025-05-01 08:33:38', '2025-05-01 08:33:38'),
(67, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تمثل المشاريع الأكاديمية جزءًا مهمًا من التعليم العالي، لكن تبرز العديد من التحديات التي تستدعي نظامًا لإدارة هذه المشاريع بكفاءة. أحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة، مما يجعل مراقبة التزام الفرق بالخطة الزمنية أمرًا صعبًا.', 'من خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظامًا إلكترونيًا لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم.', NULL, 'تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', '1. نظام لإدارة مراحل المشروع 2. أدوات لمتابعة التقدم 3. مكتبة موارد 4. نظام توصية لأعضاء الفريق', 'كشف عملاق الهواتف الذكية، أبل، النقاب عن هاتفه الذكي الجديد \"آيفون 5\"', '2025-05-01 09:52:44', '2025-05-01 09:52:44'),
(68, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'يعد العمل في المشاريع الأكاديمية أمرا هاما بالنسبة للكثيرين.', 'أعلنت جامعة الشام السورية عن إنشاء شركة مشتركة مع جامعة الشام، تهدف إلى تطوير برامج علمية.', NULL, 'طورت جامعة جامعة سان فرانسيسكو الأمريكية نظاما إلكترونيا لإدارة المشاريع الأكاديمية.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', 'أعلن رئيس مجلس إدارة مؤسسة \"أوند\"، عبد المجيد عبد العزيز، عن مشروعه لمشروع مشروع مشروع مشروع مشروع مشروع مشروع مركز الإبداع الاقتصادي.', 'كشف عملاق الهواتف الذكية، أبل، النقاب عن هاتفه الذكي الجديد \"آيفون 5\"', '2025-05-01 09:52:48', '2025-05-01 09:52:48'),
(69, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'يعد العمل في المشاريع الأكاديمية أمرا هاما بالنسبة للكثيرين.', 'أعلنت جامعة الشام السورية عن إنشاء شركة مشتركة مع جامعة الشام، تهدف إلى تطوير برامج علمية.', NULL, 'طورت جامعة جامعة سان فرانسيسكو الأمريكية نظاما إلكترونيا لإدارة المشاريع الأكاديمية.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', 'أعلن رئيس مجلس إدارة مؤسسة \"أوند\"، عبد المجيد عبد العزيز، عن مشروعه لمشروع مشروع مشروع مشروع مشروع مشروع مشروع مركز الإبداع الاقتصادي.', 'كشف عملاق الهواتف الذكية، أبل، النقاب عن هاتفه الذكي الجديد \"آيفون 5\"', '2025-05-01 10:03:32', '2025-05-01 10:03:32'),
(70, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تمثل المشاريع الأكاديمية جزءًا مهمًا من التعليم العالي، لكن تبرز العديد من التحديات التي تستدعي نظامًا لإدارة هذه المشاريع بكفاءة. أحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة، مما يجعل مراقبة التزام الفرق بالخطة الزمنية أمرًا صعبًا.', 'من خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظامًا إلكترونيًا لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم.', NULL, 'تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', '1. نظام لإدارة مراحل المشروع 2. أدوات لمتابعة التقدم 3. مكتبة موارد 4. نظام توصية لأعضاء الفريق', '1. واجهة سهلة الاستخدام 2. أداء عالي 3. أمان البيانات 4. توافق مع الأجهزة المختلفة', '2025-05-01 10:21:51', '2025-05-01 10:21:51'),
(71, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تعرف علي تحديات', 'ابحث عن نظام اداره جامعه شام', NULL, 'طور نظام الكترونيا ل اداره مشاريع', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', 'نظام اجراءات مشروع', 'اعدادات جهاز', '2025-05-01 10:22:50', '2025-05-01 10:22:50'),
(72, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تمثل المشاريع الأكاديمية جزءًا مهمًا من التعليم العالي، لكن تبرز العديد من التحديات التي تستدعي نظامًا لإدارة هذه المشاريع بكفاءة. أحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة، مما يجعل مراقبة التزام الفرق بالخطة الزمنية أمرًا صعبًا.', 'من خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظامًا إلكترونيًا لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم.', NULL, 'تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', '1. نظام لإدارة مراحل المشروع 2. أدوات لمتابعة التقدم 3. مكتبة موارد 4. نظام توصية لأعضاء الفريق', '1. واجهة سهلة الاستخدام 2. أداء عالي 3. أمان البيانات 4. توافق مع الأجهزة المختلفة', '2025-05-01 10:28:28', '2025-05-01 10:28:28'),
(73, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تمثل المشاريع الأكاديمية جزءًا مهمًا من التعليم العالي، لكن تبرز العديد من التحديات التي تستدعي نظامًا لإدارة هذه المشاريع بكفاءة. أحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة، مما يجعل مراقبة التزام الفرق بالخطة الزمنية أمرًا صعبًا.', 'من خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظامًا إلكترونيًا لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم.', NULL, 'تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', '1. نظام لإدارة مراحل المشروع 2. أدوات لمتابعة التقدم 3. مكتبة موارد 4. نظام توصية لأعضاء الفريق', '1. واجهة سهلة الاستخدام 2. أداء عالي 3. أمان البيانات 4. توافق مع الأجهزة المختلفة', '2025-05-01 10:28:38', '2025-05-01 10:28:38'),
(74, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تمثل المشاريع الأكاديمية جزءًا مهمًا من التعليم العالي، لكن تبرز العديد من التحديات التي تستدعي نظامًا لإدارة هذه المشاريع بكفاءة. أحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة، مما يجعل مراقبة التزام الفرق بالخطة الزمنية أمرًا صعبًا.', 'من خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظامًا إلكترونيًا لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم.', NULL, 'تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', '1. نظام لإدارة مراحل المشروع 2. أدوات لمتابعة التقدم 3. مكتبة موارد 4. نظام توصية لأعضاء الفريق', '1. واجهة سهلة الاستخدام 2. أداء عالي 3. أمان البيانات 4. توافق مع الأجهزة المختلفة', '2025-05-01 10:28:46', '2025-05-01 10:28:46'),
(75, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تمثل المشاريع الأكاديمية جزءًا مهمًا من التعليم العالي، لكن تبرز العديد من التحديات التي تستدعي نظامًا لإدارة هذه المشاريع بكفاءة. أحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة، مما يجعل مراقبة التزام الفرق بالخطة الزمنية أمرًا صعبًا.', 'من خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظامًا إلكترونيًا لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم.', NULL, 'تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', '1. نظام لإدارة مراحل المشروع 2. أدوات لمتابعة التقدم 3. مكتبة موارد 4. نظام توصية لأعضاء الفريق', '1. واجهة سهلة الاستخدام 2. أداء عالي 3. أمان البيانات 4. توافق مع الأجهزة المختلفة', '2025-05-01 10:29:00', '2025-05-01 10:29:00'),
(76, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', '    ‘’ ’ ‘”’  ’’ ’\'’, ‘, ””, “”. ‘. ’ ”,  ”.’. “.  ”,. “ “’\"” ‚”: “I’m sorry. I’ve got to go.” “It’s time to go,” she said.', 'The following is a modified version of an earlier version of this article. It was originally published in The Daily Mail. We are happy to clarify that it is not the same thing as saying that the word “marijuana’s” originates in the U.S.', NULL, '‘’’ ‘”’  “” is a term used to refer to a group of people who have been involved in a dispute over the use of the word ‘fraud’ in the media’. The term is used to describe people who are involved in the dispute over whether or not they are guilty of a crime.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', '1.  ‘’’. ‘”’, ””, “” and ”\"”. 2. ”.   , ‚ ‚. “,” ”, “.” 3. •  “. . .” 4. ’”,.  \' .’\'’ ”\'”', '1.  ‘’’ ‘”’. “”. ”” ”,”, “,’, ” and ”. 1.  ”,. “ ““, ”; “. ‚”: “; ”: ‚’: ”;   :  ,  :“;” : “\"; ’; ‚:”-“.” ; “', '2025-05-01 10:32:27', '2025-05-01 10:32:27'),
(77, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تمثل المشاريع الأكاديمية جزءًا مهمًا من التعليم العالي، لكن تبرز العديد من التحديات التي تستدعي نظامًا لإدارة هذه المشاريع بكفاءة. أحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة، مما يجعل مراقبة التزام الفرق بالخطة الزمنية أمرًا صعبًا.', 'من خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظامًا إلكترونيًا لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم.', NULL, 'تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', '1. نظام لإدارة مراحل المشروع 2. أدوات لمتابعة التقدم 3. مكتبة موارد 4. نظام توصية لأعضاء الفريق', '1. واجهة سهلة الاستخدام 2. أداء عالي 3. أمان البيانات 4. توافق مع الأجهزة المختلفة', '2025-05-01 10:35:54', '2025-05-01 10:35:54'),
(78, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تمثل المشاريع الأكاديمية جزءًا مهمًا من التعليم العالي، لكن تبرز العديد من التحديات التي تستدعي نظامًا لإدارة هذه المشاريع بكفاءة. أحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة، مما يجعل مراقبة التزام الفرق بالخطة الزمنية أمرًا صعبًا.', 'من خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظامًا إلكترونيًا لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم.', NULL, 'تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', '1. نظام لإدارة مراحل المشروع 2. أدوات لمتابعة التقدم 3. مكتبة موارد 4. نظام توصية لأعضاء الفريق', '1. واجهة سهلة الاستخدام 2. أداء عالي 3. أمان البيانات 4. توافق مع الأجهزة المختلفة', '2025-05-01 10:36:02', '2025-05-01 10:36:02'),
(79, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تمثل المشاريع الأكاديمية جزءًا مهمًا من التعليم العالي، لكن تبرز العديد من التحديات التي تستدعي نظامًا لإدارة هذه المشاريع بكفاءة. أحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة، مما يجعل مراقبة التزام الفرق بالخطة الزمنية أمرًا صعبًا.', 'من خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظامًا إلكترونيًا لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم.', NULL, 'تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', 'أكثر من ثلاثة آلاف مشروع يهدف إلى إنشاء نظام لإدارة مراحل المشروع.', 'واجهة سهلة الاستخدام', '2025-05-01 10:36:14', '2025-05-01 10:36:14'),
(80, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تواجه الجامعات العربية عمومًا وجامعة الشام خصوصًا تحديات كبيرة في إدارة المشاريع الأكاديمية للطلاب. تعتمد حاليًا على أنظمة تقليدية غير متكاملة تسبب العديد من المشكلات العملية. أولاً، يتم متابعة تقدم المشاريع يدويًا عبر اجتماعات أسبوعية مع المشرفين، مما يستنزف وقتًا كبيرًا من الطرفين. ثانيًا، تفتقد الجامعة إلى نظام مركزي لتخزين الوثائق والمستندات البحثية، مما يؤدي إلى تضييع الجهود المكرسة. ثالثًا، يعاني الطلاب من صعوبة في تكوين فرق عمل متجانسة بسبب عدم وجود بيانات عن مهارات زملائهم. رابعًا، يتم تقييم المشاريع بطريقة غير منهجية تعتمد على آراء شخصية أكثر من معايير موضوعية. أخيرًا، لا يوجد أرشيف رقمي للمشاريع السابقة يمكن الاستفادة منه، مما يضيع فرص البناء على المعرفة المتراكمة.', 'من خلال البحث حول آلية إدارة جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية، يتبين أن الجامعة لا تملك نظامًا إلكترونيًا لإدارة المشاريع، وتعتمد بدلاً من ذلك على وسائل التواصل مثل واتساب وتلغرام، إلى جانب المقابلات الواقعية، لمتابعة الطلاب وإدارة مشاريعهم.', NULL, 'تطوير نظام إلكتروني لإدارة المشاريع الأكاديمية سيساعد في تحسين إدارة المشاريع ويحل المشكلات الحالية، ويوفر للطلاب والمشرفين بيئة تفاعلية ومنظمة ترفع من كفاءة العمل الأكاديمي.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', 'أكثر من ثلاثة آلاف مشروع يهدف إلى إنشاء نظام لإدارة مراحل المشروع.', 'واجهة سهلة الاستخدام', '2025-05-01 10:51:07', '2025-05-01 10:51:07'),
(81, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تواجه الجامعات العربية تحديات كبيرة في إدارة المشاريع الأكاديمية للطلاب.', 'أصبحت جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية في مصر مركزاً رئيسياً للتعليم.', NULL, 'أصبحت إدارة المشاريع الأكاديمية أول مؤسسة إلكترونية في العالم.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', 'أكثر من ثلاثة آلاف مشروع يهدف إلى إنشاء نظام لإدارة مراحل المشروع.', 'واجهة سهلة الاستخدام', '2025-05-01 10:52:21', '2025-05-01 10:52:21'),
(82, NULL, 'نظام إدارة المشاريع الأكاديمية لجامعة الشام', 'تواجه الجامعات العربية تحديات كبيرة في إدارة المشاريع الأكاديمية للطلاب.', 'أصبحت جامعة الشام الخاصة لمشاريع الطلاب الأكاديمية في مصر مركزاً رئيسياً للتعليم.', NULL, 'أصبحت إدارة المشاريع الأكاديمية أول مؤسسة إلكترونية في العالم.', 'Agile', '[\"Laravel\", \"Vue.js\", \"MySQL\"]', 'أكثر من ثلاثة آلاف مشروع يهدف إلى إنشاء نظام لإدارة مراحل المشروع.', 'واجهة سهلة الاستخدام', '2025-05-01 10:52:26', '2025-05-01 10:52:26'),
(83, 52, 'مشروع نظام إدارة المشاريع', 'مشكلة إدارة المشاريع في الكلية', 'الخلفية التاريخية للمشكلة', 'mindmaps/XKKtsfNrUAvaREGf6eKTF83aWtVukSCHHXjneUtf.png', 'الحل المقترح باستخدام نظام إلكتروني', 'Agile', '[\"Laravel\", \"Vue.js\"]', '1. تسجيل الطلاب 2. إنشاء مجموعات', '1. الأمان 2. الأداء...', '2025-06-02 19:05:15', '2025-06-02 19:05:15');

-- --------------------------------------------------------

--
-- Table structure for table `project_stages`
--

CREATE TABLE `project_stages` (
  `id` bigint UNSIGNED NOT NULL,
  `project_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `due_date` date NOT NULL,
  `order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_stages`
--

INSERT INTO `project_stages` (`id`, `project_id`, `title`, `description`, `due_date`, `order`, `created_at`, `updated_at`) VALUES
(1, 55, 'مرحلة التصميم الأولي', 'تصميم واجهات المستخدم والتخطيط المعماري', '2024-08-15', 2, '2025-05-07 16:24:29', '2025-05-07 16:24:29');

-- --------------------------------------------------------

--
-- Table structure for table `proposal_experts`
--

CREATE TABLE `proposal_experts` (
  `id` bigint UNSIGNED NOT NULL,
  `proposal_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialization` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposal_supervisors`
--

CREATE TABLE `proposal_supervisors` (
  `id` bigint UNSIGNED NOT NULL,
  `proposal_id` bigint UNSIGNED NOT NULL,
  `supervisor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposal_team_members`
--

CREATE TABLE `proposal_team_members` (
  `id` bigint UNSIGNED NOT NULL,
  `proposal_id` bigint UNSIGNED NOT NULL,
  `student_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

CREATE TABLE `resources` (
  `resourceId` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('tool','reference','article') COLLATE utf8mb4_unicode_ci NOT NULL,
  `filePath` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `reviewed_by` bigint UNSIGNED DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `resources`
--

INSERT INTO `resources` (`resourceId`, `title`, `description`, `type`, `filePath`, `link`, `created_by`, `status`, `reviewed_by`, `reviewed_at`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'دليل تصميم الواجهات', 'أفضل ممارسات تصميم واجهات المستخدم', 'article', NULL, NULL, 9, 'approved', 9, '2025-05-15 02:25:02', 'المورد ممتاز', '2025-05-15 02:15:09', '2025-05-15 02:25:02'),
(2, 'مشروع تخرجي', 'بحث عن الذكاء الاصطناعي', 'article', NULL, NULL, 7, 'pending', NULL, NULL, NULL, '2025-05-15 16:07:09', '2025-05-15 16:07:09');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `scheduledId` bigint UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `type` enum('مرحلية','تحليلية','نهائية') COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` bigint UNSIGNED DEFAULT NULL,
  `time` time DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`scheduledId`, `date`, `type`, `group_id`, `time`, `location`, `notes`, `created_at`, `updated_at`) VALUES
(1, '2025-06-20', 'مرحلية', 1, '10:30:00', 'القاعة الرئيسية - مبنى الهندسة', 'يرجى إحضار نسخة من التقرير', '2025-05-27 01:06:51', '2025-05-27 01:06:51'),
(2, '2025-06-20', 'مرحلية', 52, '10:30:00', 'القاعة الرئيسية - مبنى الهندسة', 'يرجى إحضار نسخة من التقرير', '2025-05-27 01:08:15', '2025-05-27 01:08:15'),
(3, '2025-06-20', 'مرحلية', 52, '10:30:00', 'القاعة الرئيسية - مبنى الهندسة', 'يرجى إحضار نسخة من التقرير', '2025-05-27 01:18:04', '2025-05-27 01:18:04'),
(4, '2025-06-20', 'مرحلية', 1, '10:30:00', 'القاعة الرئيسية - مبنى الهندسة', 'يرجى إحضار نسخة من التقرير', '2025-05-27 01:32:09', '2025-05-27 01:32:09'),
(5, '2025-06-20', 'مرحلية', 1, '10:30:00', 'القاعة الرئيسية - مبنى الهندسة', 'يرجى إحضار نسخة من التقرير', '2025-05-27 01:33:50', '2025-05-27 01:33:50'),
(6, '2025-06-20', 'مرحلية', 52, '10:30:00', 'القاعة الرئيسية - مبنى الهندسة', 'يرجى إحضار نسخة من التقرير', '2025-05-27 01:34:00', '2025-05-27 01:34:00');

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Python', '2025-05-04 15:53:00', '2025-05-04 15:53:00'),
(2, 'Machine Learning', '2025-05-04 15:53:00', '2025-05-04 15:53:00'),
(3, 'Laravel', '2025-05-04 15:53:00', '2025-05-04 15:53:00'),
(4, 'Vue.js', '2025-05-04 15:53:00', '2025-05-04 15:53:00'),
(5, 'React', '2025-05-04 15:53:00', '2025-05-04 15:53:00'),
(6, 'Database Design', '2025-05-04 15:53:00', '2025-05-04 15:53:00'),
(7, 'DevOps', '2025-05-04 15:53:00', '2025-05-04 15:53:00'),
(8, 'UI/UX', '2025-05-04 15:53:00', '2025-05-04 15:53:00'),
(9, 'Python', '2025-05-04 16:35:46', '2025-05-04 16:35:46'),
(10, 'Machine Learning', '2025-05-04 16:35:46', '2025-05-04 16:35:46'),
(11, 'Laravel', '2025-05-04 16:35:46', '2025-05-04 16:35:46'),
(12, 'Vue.js', '2025-05-04 16:35:46', '2025-05-04 16:35:46'),
(13, 'React', '2025-05-04 16:35:46', '2025-05-04 16:35:46'),
(14, 'Database Design', '2025-05-04 16:35:46', '2025-05-04 16:35:46'),
(15, 'DevOps', '2025-05-04 16:35:46', '2025-05-04 16:35:46'),
(16, 'UI/UX', '2025-05-04 16:35:46', '2025-05-04 16:35:46'),
(17, 'Python', '2025-05-04 17:04:47', '2025-05-04 17:04:47'),
(18, 'Machine Learning', '2025-05-04 17:04:47', '2025-05-04 17:04:47'),
(19, 'Laravel', '2025-05-04 17:04:47', '2025-05-04 17:04:47'),
(20, 'Vue.js', '2025-05-04 17:04:47', '2025-05-04 17:04:47'),
(21, 'React', '2025-05-04 17:04:47', '2025-05-04 17:04:47'),
(22, 'Database Design', '2025-05-04 17:04:47', '2025-05-04 17:04:47'),
(23, 'DevOps', '2025-05-04 17:04:47', '2025-05-04 17:04:47'),
(24, 'UI/UX', '2025-05-04 17:04:47', '2025-05-04 17:04:47'),
(25, 'برمجة Python', '2025-05-19 02:28:58', '2025-05-19 02:28:58'),
(26, 'تطوير الويب (HTML, CSS, JS)', '2025-05-19 02:28:58', '2025-05-19 02:28:58'),
(27, 'قواعد البيانات (SQL)', '2025-05-19 02:28:58', '2025-05-19 02:28:58'),
(28, 'تعلم الآلة', '2025-05-19 02:28:58', '2025-05-19 02:28:58'),
(29, 'أمن المعلومات', '2025-05-19 02:28:58', '2025-05-19 02:28:58');

-- --------------------------------------------------------

--
-- Table structure for table `skill_student`
--

CREATE TABLE `skill_student` (
  `id` bigint UNSIGNED NOT NULL,
  `student_id` bigint UNSIGNED NOT NULL,
  `skill_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `skill_student`
--

INSERT INTO `skill_student` (`id`, `student_id`, `skill_id`, `created_at`, `updated_at`) VALUES
(1, 4, 3, NULL, NULL),
(2, 4, 11, NULL, NULL),
(3, 4, 19, NULL, NULL),
(4, 5, 1, NULL, NULL),
(5, 5, 2, NULL, NULL),
(6, 5, 9, NULL, NULL),
(7, 5, 10, NULL, NULL),
(8, 5, 17, NULL, NULL),
(9, 5, 18, NULL, NULL),
(10, 7, 8, NULL, NULL),
(11, 7, 16, NULL, NULL),
(12, 7, 24, NULL, NULL),
(13, 8, 7, NULL, NULL),
(14, 8, 15, NULL, NULL),
(15, 8, 23, NULL, NULL),
(366, 2, 10, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(367, 2, 18, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(368, 2, 21, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(369, 2, 8, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(370, 2, 22, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(371, 3, 8, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(372, 3, 9, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(373, 3, 22, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(374, 3, 16, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(375, 3, 3, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(376, 4, 14, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(377, 4, 24, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(378, 4, 22, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(379, 5, 6, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(380, 5, 12, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(381, 5, 13, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(382, 5, 15, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(383, 5, 1, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(384, 6, 9, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(385, 6, 8, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(386, 6, 10, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(387, 7, 12, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(388, 7, 23, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(389, 7, 6, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(390, 8, 5, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(391, 8, 13, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(392, 8, 11, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(393, 8, 19, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(394, 59, 20, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(395, 59, 24, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(396, 59, 18, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(397, 60, 17, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(398, 60, 21, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(399, 60, 15, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(400, 60, 9, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(401, 61, 7, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(402, 61, 22, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(403, 61, 4, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(404, 61, 10, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(405, 62, 22, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(406, 62, 3, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(407, 62, 4, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(408, 62, 1, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(409, 62, 15, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(410, 63, 4, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(411, 63, 23, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(412, 64, 19, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(413, 64, 5, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(414, 64, 17, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(415, 64, 24, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(416, 65, 15, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(417, 65, 4, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(418, 65, 20, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(419, 65, 21, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(420, 65, 5, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(421, 66, 11, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(422, 66, 23, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(423, 66, 2, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(424, 67, 24, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(425, 67, 20, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(426, 68, 1, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(427, 68, 23, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(428, 68, 20, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(429, 68, 16, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(430, 69, 13, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(431, 69, 18, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(432, 69, 9, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(433, 70, 21, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(434, 70, 8, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(435, 70, 7, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(436, 71, 14, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(437, 71, 20, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(438, 71, 3, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(439, 71, 10, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(440, 72, 2, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(441, 72, 20, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(442, 72, 18, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(443, 72, 3, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(444, 73, 4, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(445, 73, 18, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(446, 74, 5, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(447, 74, 24, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(448, 74, 17, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(449, 74, 4, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(450, 75, 5, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(451, 75, 8, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(452, 76, 18, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(453, 76, 1, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(454, 76, 19, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(455, 77, 3, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(456, 77, 21, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(457, 78, 15, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(458, 78, 14, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(459, 78, 11, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(460, 78, 19, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(461, 79, 21, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(462, 79, 16, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(463, 79, 13, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(464, 79, 23, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(465, 79, 24, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(466, 80, 12, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(467, 80, 14, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(468, 81, 20, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(469, 81, 5, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(470, 81, 21, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(471, 82, 21, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(472, 82, 10, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(473, 82, 8, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(474, 82, 7, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(475, 83, 13, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(476, 83, 23, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(477, 84, 1, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(478, 84, 15, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(479, 84, 8, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(480, 85, 5, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(481, 85, 14, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(482, 86, 24, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(483, 86, 21, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(484, 86, 16, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(485, 86, 19, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(486, 87, 10, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(487, 87, 5, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(488, 87, 24, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(489, 87, 22, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(490, 87, 9, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(491, 88, 14, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(492, 88, 21, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(493, 88, 24, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(494, 89, 13, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(495, 89, 4, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(496, 89, 9, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(497, 90, 8, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(498, 90, 17, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(499, 90, 12, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(500, 91, 3, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(501, 91, 6, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(502, 91, 16, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(503, 91, 24, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(504, 91, 22, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(505, 92, 4, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(506, 92, 14, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(507, 92, 19, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(508, 92, 9, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(509, 93, 17, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(510, 93, 4, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(511, 93, 21, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(512, 93, 16, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(513, 94, 6, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(514, 94, 23, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(515, 94, 14, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(516, 94, 19, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(517, 94, 2, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(518, 95, 16, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(519, 95, 5, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(520, 95, 14, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(521, 95, 10, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(522, 96, 13, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(523, 97, 6, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(524, 97, 9, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(525, 97, 11, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(526, 97, 20, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(527, 97, 3, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(528, 97, 2, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(529, 97, 8, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(530, 98, 2, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(531, 98, 15, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(532, 98, 11, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(533, 98, 6, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(534, 99, 11, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(535, 99, 20, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(536, 100, 12, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(537, 100, 20, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(538, 101, 7, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(539, 101, 18, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(540, 101, 8, '2025-05-06 15:53:12', '2025-05-06 15:53:12'),
(541, 2, 1, '2025-05-19 02:33:47', '2025-05-19 02:33:47'),
(542, 111, 9, '2025-05-22 01:31:08', '2025-05-22 01:31:08'),
(543, 121, 3, '2025-05-24 05:00:25', '2025-05-24 05:00:25'),
(544, 126, 4, '2025-05-29 06:21:13', '2025-05-29 06:21:13'),
(545, 129, 2, '2025-05-29 06:57:06', '2025-05-29 06:57:06'),
(546, 130, 6, '2025-05-29 07:52:53', '2025-05-29 07:52:53'),
(547, 141, 3, '2025-06-02 17:17:28', '2025-06-02 17:17:28'),
(548, 143, 1, '2025-06-03 02:37:27', '2025-06-03 02:37:27'),
(549, 144, 4, '2025-06-03 03:50:33', '2025-06-03 03:50:33');

-- --------------------------------------------------------

--
-- Table structure for table `stage_submissions`
--

CREATE TABLE `stage_submissions` (
  `id` bigint UNSIGNED NOT NULL,
  `project_stage_id` bigint UNSIGNED NOT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','submitted','reviewed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `grade` decimal(5,2) DEFAULT NULL,
  `reviewed_by` bigint UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `studentId` bigint UNSIGNED NOT NULL,
  `userId` bigint UNSIGNED NOT NULL,
  `experience` json DEFAULT NULL,
  `experience_media_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'text, image, video, mixed',
  `university_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'الرقم الجامعي',
  `major` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'التخصص',
  `academic_year` int DEFAULT NULL COMMENT 'السنة الدراسية',
  `gpa` double(3,2) DEFAULT NULL COMMENT 'Between 0.00 to 4.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`studentId`, `userId`, `experience`, `experience_media_type`, `university_number`, `major`, `academic_year`, `gpa`, `created_at`, `updated_at`) VALUES
(2, 7, '[{\"type\": \"text\", \"content\": \"خبرة في تطوير الويب باستخدام Laravel\", \"created_at\": \"2025-05-24 19:22:20\"}, {\"type\": \"image\", \"content\": \"/storage/experience/68321c6cb14e4.png\", \"created_at\": \"2025-05-24 19:22:20\"}, {\"type\": \"video\", \"content\": \"https://www.youtube.com/embed/dQw4w9WgXcQ\", \"created_at\": \"2025-05-24 19:22:21\"}]', 'mixed', '20201000', 'هندسة البرمجيات', 3, 3.75, '2025-04-09 09:45:27', '2025-05-24 16:22:21'),
(3, 10, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-02 12:37:20', '2025-05-02 12:37:20'),
(4, 14, '[{\"type\": \"text\", \"content\": \"Developed REST APIs using React for university management system\"}]', NULL, NULL, NULL, NULL, 3.60, '2025-05-04 17:04:48', '2025-05-04 17:04:48'),
(5, 15, '[{\"type\": \"text\", \"content\": \"Created computer vision models for traffic monitoring system\"}]', NULL, NULL, NULL, NULL, 3.90, '2025-05-04 17:04:48', '2025-05-04 17:04:48'),
(6, 16, '[{\"type\": \"text\", \"content\": \"Built React app for local charity organization\"}]', NULL, NULL, NULL, NULL, 3.20, '2025-05-04 17:04:49', '2025-05-04 17:04:49'),
(7, 17, '[{\"type\": \"text\", \"content\": \"Designed user interfaces for mobile banking app\"}]', NULL, NULL, NULL, NULL, 3.70, '2025-05-04 17:04:49', '2025-05-04 17:04:49'),
(8, 18, '[{\"type\": \"text\", \"content\": \"Deployed scalable web app on AWS with load balancing\"}]', NULL, NULL, NULL, NULL, 3.40, '2025-05-04 17:04:49', '2025-05-04 17:04:49'),
(59, 119, '[{\"type\": \"text\", \"content\": \"Participated in a hackathon and built a data analysis tool\"}]', NULL, NULL, NULL, NULL, 2.12, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(60, 120, '[{\"type\": \"text\", \"content\": \"Built a login system with Node.js\"}]', NULL, NULL, NULL, NULL, 2.07, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(61, 121, '[{\"type\": \"text\", \"content\": \"Contributed to a task management project with React\"}]', NULL, NULL, NULL, NULL, 3.61, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(62, 122, '[{\"type\": \"text\", \"content\": \"Worked on an open-source educational platform\"}]', NULL, NULL, NULL, NULL, 3.62, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(63, 123, '[{\"type\": \"text\", \"content\": \"Integrated third-party APIs in a graduation project\"}]', NULL, NULL, NULL, NULL, 3.21, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(64, 124, '[{\"type\": \"text\", \"content\": \"Designed a database for a university project using MySQL\"}]', NULL, NULL, NULL, NULL, 2.29, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(65, 125, '[{\"type\": \"text\", \"content\": \"Built a login system with Node.js\"}]', NULL, NULL, NULL, NULL, 3.29, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(66, 126, '[{\"type\": \"text\", \"content\": \"Worked on an open-source educational platform\"}]', NULL, NULL, NULL, NULL, 2.62, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(67, 127, '[{\"type\": \"text\", \"content\": \"Participated in a hackathon and built a data analysis tool\"}]', NULL, NULL, NULL, NULL, 3.19, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(68, 128, '[{\"type\": \"text\", \"content\": \"Developed an e-commerce website using Django\"}]', NULL, NULL, NULL, NULL, 3.54, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(69, 129, '[{\"type\": \"text\", \"content\": \"Built a login system with Node.js\"}]', NULL, NULL, NULL, NULL, 3.72, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(70, 130, '[{\"type\": \"text\", \"content\": \"Worked on an open-source educational platform\"}]', NULL, NULL, NULL, NULL, 3.93, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(71, 131, '[{\"type\": \"text\", \"content\": \"Participated in a hackathon and built a data analysis tool\"}]', NULL, NULL, NULL, NULL, 2.58, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(72, 132, '[{\"type\": \"text\", \"content\": \"Built a login system with Node.js\"}]', NULL, NULL, NULL, NULL, 2.02, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(73, 133, '[{\"type\": \"text\", \"content\": \"Designed a database for a university project using MySQL\"}]', NULL, NULL, NULL, NULL, 3.07, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(74, 134, '[{\"type\": \"text\", \"content\": \"Developed an e-commerce website using Django\"}]', NULL, NULL, NULL, NULL, 3.89, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(75, 135, '[{\"type\": \"text\", \"content\": \"Developed a mobile app using Flutter\"}]', NULL, NULL, NULL, NULL, 3.82, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(76, 136, '[{\"type\": \"text\", \"content\": \"Contributed to a task management project with React\"}]', NULL, NULL, NULL, NULL, 2.16, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(77, 137, '[{\"type\": \"text\", \"content\": \"Built a web application using Laravel\"}]', NULL, NULL, NULL, NULL, 2.51, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(78, 138, '[{\"type\": \"text\", \"content\": \"Integrated third-party APIs in a graduation project\"}]', NULL, NULL, NULL, NULL, 3.02, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(79, 139, '[{\"type\": \"text\", \"content\": \"Designed a database for a university project using MySQL\"}]', NULL, NULL, NULL, NULL, 3.67, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(80, 140, '[{\"type\": \"text\", \"content\": \"Worked on an open-source educational platform\"}]', NULL, NULL, NULL, NULL, 3.47, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(81, 141, '[{\"type\": \"text\", \"content\": \"Developed an e-commerce website using Django\"}]', NULL, NULL, NULL, NULL, 2.24, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(82, 142, '[{\"type\": \"text\", \"content\": \"Built a login system with Node.js\"}]', NULL, NULL, NULL, NULL, 3.18, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(83, 143, '[{\"type\": \"text\", \"content\": \"Built a login system with Node.js\"}]', NULL, NULL, NULL, NULL, 2.43, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(84, 144, '[{\"type\": \"text\", \"content\": \"Designed a database for a university project using MySQL\"}]', NULL, NULL, NULL, NULL, 3.97, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(85, 145, '[{\"type\": \"text\", \"content\": \"Worked on an open-source educational platform\"}]', NULL, NULL, NULL, NULL, 3.48, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(86, 146, '[{\"type\": \"text\", \"content\": \"Created a user interface with HTML, CSS, and JavaScript\"}]', NULL, NULL, NULL, NULL, 2.09, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(87, 147, '[{\"type\": \"text\", \"content\": \"Worked on an open-source educational platform\"}]', NULL, NULL, NULL, NULL, 2.31, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(88, 148, '[{\"type\": \"text\", \"content\": \"Developed an e-commerce website using Django\"}]', NULL, NULL, NULL, NULL, 2.28, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(89, 149, '[{\"type\": \"text\", \"content\": \"Built a web application using Laravel\"}]', NULL, NULL, NULL, NULL, 3.34, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(90, 150, '[{\"type\": \"text\", \"content\": \"Developed an e-commerce website using Django\"}]', NULL, NULL, NULL, NULL, 3.68, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(91, 151, '[{\"type\": \"text\", \"content\": \"Worked on an open-source educational platform\"}]', NULL, NULL, NULL, NULL, 2.02, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(92, 152, '[{\"type\": \"text\", \"content\": \"Developed an e-commerce website using Django\"}]', NULL, NULL, NULL, NULL, 2.52, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(93, 153, '[{\"type\": \"text\", \"content\": \"Worked on an open-source educational platform\"}]', NULL, NULL, NULL, NULL, 3.30, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(94, 154, '[{\"type\": \"text\", \"content\": \"Designed a database for a university project using MySQL\"}]', NULL, NULL, NULL, NULL, 2.45, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(95, 155, '[{\"type\": \"text\", \"content\": \"Participated in a hackathon and built a data analysis tool\"}]', NULL, NULL, NULL, NULL, 3.67, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(96, 156, '[{\"type\": \"text\", \"content\": \"Integrated third-party APIs in a graduation project\"}]', NULL, NULL, NULL, NULL, 2.80, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(97, 157, '[{\"type\": \"text\", \"content\": \"Participated in a hackathon and built a data analysis tool\"}]', NULL, NULL, NULL, NULL, 3.29, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(98, 158, '[{\"type\": \"text\", \"content\": \"Built a web application using Laravel\"}]', NULL, NULL, NULL, NULL, 2.59, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(99, 159, '[{\"type\": \"text\", \"content\": \"Built a web application using Laravel\"}]', NULL, NULL, NULL, NULL, 2.99, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(100, 160, '[{\"type\": \"text\", \"content\": \"Built a web application using Laravel\"}]', NULL, NULL, NULL, NULL, 3.32, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(101, 161, '[{\"type\": \"text\", \"content\": \"Built a login system with Node.js\"}]', NULL, NULL, NULL, NULL, 2.97, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(102, 162, '[{\"type\": \"text\", \"content\": \"Integrated third-party APIs in a graduation project\"}]', NULL, NULL, NULL, NULL, 3.33, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(103, 163, '[{\"type\": \"text\", \"content\": \"Created a user interface with HTML, CSS, and JavaScript and React\"}]', NULL, NULL, NULL, NULL, 3.99, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(104, 164, '[{\"type\": \"text\", \"content\": \"Developed an e-commerce website using Django\"}]', NULL, NULL, NULL, NULL, 3.27, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(105, 165, '[{\"type\": \"text\", \"content\": \"Developed an e-commerce website using Django\"}]', NULL, NULL, NULL, NULL, 2.10, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(106, 166, '[{\"type\": \"text\", \"content\": \"Worked on an open-source educational platform\"}]', NULL, NULL, NULL, NULL, 3.02, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(107, 167, '[{\"type\": \"text\", \"content\": \"Participated in a hackathon and built a data analysis tool\"}]', NULL, NULL, NULL, NULL, 2.69, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(108, 168, '[{\"type\": \"text\", \"content\": \"Built a web application using Laravel\"}]', NULL, NULL, NULL, NULL, 2.71, '2025-05-06 17:41:36', '2025-05-06 17:41:36'),
(109, 219, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-21 23:30:24', '2025-05-21 23:30:24'),
(110, 220, '[]', NULL, NULL, NULL, NULL, 0.06, '2025-05-22 00:59:51', '2025-05-22 00:59:54'),
(111, 221, '[]', NULL, NULL, NULL, NULL, 3.39, '2025-05-22 01:31:07', '2025-05-22 01:31:08'),
(112, 222, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-23 04:12:17', '2025-05-23 04:12:17'),
(113, 223, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-23 04:47:50', '2025-05-23 04:47:50'),
(114, 224, '[]', NULL, NULL, NULL, NULL, 0.04, '2025-05-23 04:50:31', '2025-05-23 04:50:32'),
(115, 225, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-23 12:20:03', '2025-05-23 12:20:03'),
(116, 226, '[]', NULL, NULL, NULL, NULL, 0.07, '2025-05-23 16:31:05', '2025-05-23 16:31:05'),
(117, 227, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-23 17:11:56', '2025-05-23 17:11:56'),
(118, 228, '[]', NULL, NULL, NULL, NULL, 0.11, '2025-05-23 17:44:56', '2025-05-23 17:44:57'),
(119, 229, '[]', NULL, NULL, NULL, NULL, 0.00, '2025-05-23 18:25:53', '2025-05-23 18:25:54'),
(120, 230, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-24 00:31:31', '2025-05-24 00:31:31'),
(121, 231, '[]', NULL, '020041713', 'برمجيات', 1, 0.03, '2025-05-24 05:00:23', '2025-05-24 05:00:24'),
(122, 232, '[{\"type\": \"text\", \"content\": \"{\\\"title\\\":\\\"ndjn\\\",\\\"date\\\":\\\"ndaln\\\",\\\"description\\\":\\\"nfalnfd\\\"}\", \"created_at\": \"2025-05-28 07:56:39\"}]', 'text', 'njafj', 'برمجيات', 4, 0.14, '2025-05-28 04:56:34', '2025-05-28 04:56:39'),
(123, 233, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-29 05:47:09', '2025-05-29 05:47:09'),
(124, 234, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-29 06:18:37', '2025-05-29 06:18:37'),
(125, 235, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-29 06:19:29', '2025-05-29 06:19:29'),
(126, 236, '[]', 'text', '020041714', 'ذكاء صنعي', 1, 3.00, '2025-05-29 06:21:12', '2025-05-29 06:21:12'),
(127, 237, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-29 06:43:01', '2025-05-29 06:43:01'),
(128, 238, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-29 06:52:07', '2025-05-29 06:52:07'),
(129, 239, '[{\"type\": \"text\", \"content\": \"{\\\"title\\\":\\\"تىتى\\\",\\\"date\\\":\\\"مة\\\",\\\"description\\\":\\\"ىنتى\\\"}\", \"created_at\": \"2025-05-29 09:57:05\"}]', 'text', 'SDNFKNKFN', 'برمجيات', 1, 3.00, '2025-05-29 06:57:04', '2025-05-29 06:57:05'),
(130, 240, '[]', 'text', 'lmdfalkmf', 'ذكاء صنعي', 1, 4.00, '2025-05-29 07:52:52', '2025-05-29 07:52:53'),
(131, 241, '[]', 'text', 'nudhnsfhn', 'ndfunfn', 1, 0.00, '2025-05-29 08:34:17', '2025-05-29 08:34:18'),
(132, 242, '[]', 'text', 'nfksjngjn', 'jnjng', 1, 0.00, '2025-05-29 09:21:45', '2025-05-29 09:21:45'),
(133, 243, '[]', 'text', 'lklkll', 'شبكات', 1, 0.00, '2025-06-01 16:40:27', '2025-06-01 16:40:28'),
(134, 244, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-01 16:46:46', '2025-06-01 16:46:46'),
(135, 245, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-01 16:47:41', '2025-06-01 16:47:41'),
(136, 246, '[]', 'text', '4546464654', 'برمجيات', 1, 0.00, '2025-06-01 16:48:35', '2025-06-01 16:48:36'),
(137, 247, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 12:07:06', '2025-06-02 12:07:06'),
(138, 248, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 16:36:30', '2025-06-02 16:36:30'),
(139, 249, '[]', 'text', '020041716', 'برمجيات', 2, 0.00, '2025-06-02 17:03:34', '2025-06-02 17:03:35'),
(140, 250, '[{\"type\": \"text\", \"content\": \"{\\\"title\\\":\\\"انشاء موقع لمؤسسة الدندشي\\\",\\\"date\\\":\\\"3 سنوات\\\",\\\"description\\\":\\\"قمت بانشاء موقع\\\"}\", \"created_at\": \"2025-06-02 20:15:02\"}]', 'text', '020041775', 'ذكاء صنعي', 2, 4.00, '2025-06-02 17:14:58', '2025-06-02 17:15:02'),
(141, 251, '[{\"type\": \"text\", \"content\": \"{\\\"title\\\":\\\"انشاء موقع لجميعة\\\",\\\"date\\\":\\\"3 شهور \\\",\\\"description\\\":\\\"فرونت \\\"}\", \"created_at\": \"2025-06-02 20:17:27\"}]', 'text', '020071179', 'شبكات', 1, 0.09, '2025-06-02 17:17:26', '2025-06-02 17:17:27'),
(142, 252, '[]', 'text', '020051713', 'ذكاء صنعي', 1, 0.00, '2025-06-02 18:12:40', '2025-06-02 18:12:41'),
(143, 253, '[{\"type\": \"text\", \"content\": \"{\\\"title\\\":\\\"Vue.js\\\",\\\"date\\\":\\\"شهر\\\",\\\"description\\\":\\\"build a website with vue.js and laravel\\\"}\", \"created_at\": \"2025-06-03 05:37:27\"}]', 'text', '02004565', 'ذكاء صنعي', 2, 0.10, '2025-06-03 02:37:26', '2025-06-03 02:37:27'),
(144, 254, '[{\"type\": \"text\", \"content\": \"{\\\"title\\\":\\\"kjakf\\\",\\\"date\\\":\\\"kdfk\\\",\\\"description\\\":\\\"Build a website with vue.js\\\"}\", \"created_at\": \"2025-06-03 06:50:32\"}]', 'text', '020881736', 'برمجيات', 1, 4.00, '2025-06-03 03:50:32', '2025-06-03 03:50:32'),
(145, 255, '[]', 'text', '020045554', 'شبكات', 1, 0.00, '2025-06-03 05:52:57', '2025-06-03 05:52:58'),
(146, 256, '[]', 'text', '0210512154', 'شبكات', 1, 0.00, '2025-06-05 09:06:07', '2025-06-05 09:06:08'),
(147, 257, '[]', 'text', '050042515', 'ذكاء صنعي', 1, 0.00, '2025-06-06 23:37:16', '2025-06-06 23:37:21'),
(148, 258, '[]', 'text', '044515045', '[رمجيلات', 1, 0.00, '2025-06-07 14:05:10', '2025-06-07 14:05:11'),
(149, 259, '[]', 'text', '515000210', 'ذكاء صنعي', 1, 0.00, '2025-06-08 00:24:30', '2025-06-08 00:24:30');

-- --------------------------------------------------------

--
-- Table structure for table `supervisors`
--

CREATE TABLE `supervisors` (
  `supervisorId` bigint UNSIGNED NOT NULL,
  `userId` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supervisors`
--

INSERT INTO `supervisors` (`supervisorId`, `userId`, `created_at`, `updated_at`) VALUES
(1, 11, '2025-05-02 12:44:50', '2025-05-02 12:44:50'),
(2, 169, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(3, 170, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(4, 171, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(5, 172, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(6, 173, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(7, 174, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(8, 175, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(9, 176, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(10, 177, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(11, 178, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(12, 179, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(13, 180, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(14, 181, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(15, 182, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(16, 183, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(17, 184, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(18, 185, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(19, 186, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(20, 187, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(21, 188, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(22, 189, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(23, 190, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(24, 191, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(25, 192, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(26, 193, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(27, 194, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(28, 195, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(29, 196, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(30, 197, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(31, 198, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(32, 199, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(33, 200, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(34, 201, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(35, 202, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(36, 203, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(37, 204, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(38, 205, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(39, 206, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(40, 207, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(41, 208, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(42, 209, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(43, 210, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(44, 211, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(45, 212, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(46, 213, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(47, 214, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(48, 215, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(49, 216, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(50, 217, '2025-05-06 17:41:57', '2025-05-06 17:41:57'),
(51, 218, '2025-05-06 17:41:57', '2025-05-06 17:41:57');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` bigint UNSIGNED NOT NULL,
  `project_stage_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `assigned_to` bigint UNSIGNED NOT NULL,
  `status` enum('pending','in_progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `due_date` date NOT NULL,
  `assigned_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `project_stage_id`, `title`, `description`, `assigned_to`, `status`, `due_date`, `assigned_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'تصميم واجهة المستخدم', NULL, 2, 'pending', '2024-05-10', 11, '2025-05-14 02:04:41', '2025-05-14 02:04:41');

-- --------------------------------------------------------

--
-- Table structure for table `task_submissions`
--

CREATE TABLE `task_submissions` (
  `id` bigint UNSIGNED NOT NULL,
  `task_id` bigint UNSIGNED NOT NULL,
  `studentId` bigint UNSIGNED NOT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `grade` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'رقم الهاتف',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('student','supervisor','coordinator','department_head','alumni') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'student',
  `profile_picture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `name`, `email`, `phone`, `password`, `role`, `profile_picture`, `created_at`, `updated_at`, `deleted_at`) VALUES
(7, 'رنيم', 'ranim@example.com', NULL, '$2y$12$kqUbgkRL.GuBGkpJZhmytOlDQnjhP9yFXCjKvW8pIqrnO.39oxe3u', 'student', NULL, '2025-04-09 09:45:27', '2025-04-09 09:45:27', NULL),
(9, 'Project Coordinator', 'coordinator@example.com', NULL, '$2y$12$mzs1VPi6ymj8ghszJK.2Oer8xN3bGb/4jqb13AIfiGlCgc7s95MZW', 'coordinator', NULL, '2025-04-09 09:56:03', '2025-04-09 09:56:03', NULL),
(10, 'معاذ', 'mouaz@example.com', NULL, '$2y$12$IEiyfBXrcFnkhYTEd5r8FekHLJ3/l3Qc.ag6IBzNmlhaQre6Rviqa', 'student', NULL, '2025-05-02 12:37:20', '2025-05-02 12:37:20', NULL),
(11, 'Dr. Ahmad Supervisor', 'supervisor@example.com', NULL, '$2y$12$qUqfJNv.p0tRDvKVwXiD/e9WQA67CyqTlSeQkg5EeQ43b3SBhfOGa', 'supervisor', NULL, '2025-05-02 12:44:50', '2025-05-02 12:44:50', NULL),
(12, 'Ahmed Ali', 'ahmed@example.com', NULL, '$2y$12$JZLGpF33zsaEg8z2w1q3vOlNugwMDPu637Qr92Q7vQHIipH6diFA2', 'student', NULL, '2025-05-04 15:53:01', '2025-05-04 15:53:01', NULL),
(14, 'Mohamed Hassan', 'mohamed.h@example.com', NULL, '$2y$12$MEvODxivbjvkVA60C8A/EuoNXDWT0VKjMoLLKcQN4ZDUueW5V5Xu2', 'student', NULL, '2025-05-04 17:04:48', '2025-05-04 17:04:48', NULL),
(15, 'Fatima Al-Mansoori', 'fatima.alm@example.com', NULL, '$2y$12$ebLN5Yp3EwGN/Bru9Z9TA.QDCVxeVyLxaWffhrWggA4v/kRN1cHdq', 'student', NULL, '2025-05-04 17:04:48', '2025-05-04 17:04:48', NULL),
(16, 'Khalid Abdullah', 'khalid.dev@example.com', NULL, '$2y$12$9Z0Jk2nnv5XgAKjFdJFmMO7EOUepukRI0hgotW0KaQ2p5HcmAqnJ.', 'student', NULL, '2025-05-04 17:04:49', '2025-05-04 17:04:49', NULL),
(17, 'Layla Mahmoud', 'layla.uiux@example.com', NULL, '$2y$12$gBuEvZEnefTNRC2kP0/N..SEF5W7SbiJstncefPo5c4Z0xyoIKhR.', 'student', NULL, '2025-05-04 17:04:49', '2025-05-04 17:04:49', NULL),
(18, 'Omar Farooq', 'omar.cloud@example.com', NULL, '$2y$12$jVus2vw8pdB2XuLHU/9UgO9.SPdzENWbRf7S0SbQR4tMHpXaOO7XC', 'student', NULL, '2025-05-04 17:04:49', '2025-05-04 17:04:49', NULL),
(119, 'Kevin Hall', 'hardytamara@anderson.net', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(120, 'Jeffrey Wright', 'victoria38@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(121, 'Tonya Warren', 'roberto07@yahoo.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(122, 'Casey Johnson', 'duffysabrina@huerta.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(123, 'Jonathan Nolan', 'barbara33@hart.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(124, 'Alex Rodgers', 'jsmith@taylor.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(125, 'Angela Hughes', 'westjulie@figueroa.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(126, 'Jacqueline Ross', 'johnnytaylor@keller.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(127, 'Jon Ortega', 'mirandasolomon@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(128, 'Sonya Valentine', 'smccall@peterson.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(129, 'Nathan Williams', 'bflores@alexander-francis.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(130, 'Gerald Lowe', 'zscott@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(131, 'Debra Keller', 'donovanjoseph@davis.info', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(132, 'Cory Vasquez', 'ohughes@sanchez-jones.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(133, 'Mark Casey', 'samantha34@vega.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(134, 'Nancy Ellis', 'keitharnold@choi-smith.net', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(135, 'Mary Nichols', 'ashleysanchez@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(136, 'Brian Davis', 'udodson@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(137, 'Michael Strickland', 'robin93@yahoo.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(138, 'Jennifer Reed', 'john18@yahoo.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(139, 'Donna Sweeney', 'david61@tucker.biz', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(140, 'Kristen Hogan', 'paceelaine@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(141, 'Lisa Douglas', 'mwells@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(142, 'Mark Robinson', 'qsmith@simmons.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(143, 'Richard Hinton', 'joshua79@soto-dickerson.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(144, 'Jessica Gonzalez', 'jeanne14@cook.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(145, 'Elizabeth Taylor', 'elizabeth32@tran.biz', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(146, 'Holly Mcdonald', 'sergiodunn@robinson.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(147, 'Erik Holden', 'joshuasmith@bennett.org', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(148, 'Eric Montgomery', 'jason26@yahoo.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(149, 'Dylan Morse', 'cynthialambert@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(150, 'Daniel Hernandez', 'darlene47@wilson-barron.info', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(151, 'Yolanda Munoz', 'tburton@cooper-chapman.info', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(152, 'Mr. Michael Garza DVM', 'josephzhang@smith.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(153, 'Molly Johnson', 'deborahmason@doyle.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(154, 'Gina Kelley', 'collinspriscilla@yahoo.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(155, 'Ellen Carter', 'leachkrista@robinson.info', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(156, 'Rodney Jennings', 'simmonseric@rose-lopez.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(157, 'Cynthia Simon', 'erik14@greene.info', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(158, 'Jesse Cameron', 'jeromerodriguez@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(159, 'Amber Warren', 'melanie11@dixon.org', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(160, 'Robert Benson', 'corey91@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(161, 'Nicholas Reid', 'dpace@warner-jackson.biz', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(162, 'Vanessa Quinn', 'frederickpalmer@lopez-fernandez.net', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(163, 'Katherine Patterson DVM', 'davidhoward@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(164, 'John Bennett', 'david81@smith.biz', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(165, 'Diane Nguyen', 'heather96@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(166, 'Brooke Schneider', 'joneskenneth@rivera-smith.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(167, 'Robert Smith', 'monique73@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(168, 'Christopher Perez', 'danielpham@leonard.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'student', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(169, 'Dr. Tracy Wagner DDS', 'zosborn@yahoo.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(170, 'Carla Harrington', 'sheila35@smith-bell.net', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(171, 'John Perry', 'randy28@sanchez.biz', NULL, '$2y$12$RjSFXbFhWUQ3lfcPpYkGeuhdJF1e/G/H/ZcQnw9U4TsikywzZYKwi', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-07 04:58:15', NULL),
(172, 'Paul Davis', 'oconnelljames@yahoo.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(173, 'Laura Hudson', 'reneewilson@barnes.biz', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(174, 'Lisa Miller', 'dickersondakota@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(175, 'David Wilson', 'andrewanderson@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(176, 'Susan White', 'jamesaudrey@montgomery.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(177, 'Gerald Baker', 'charles40@rhodes-bright.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(178, 'Walter Kirby', 'tammygarcia@collins.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(179, 'Victoria Lynch', 'csolomon@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(180, 'Daniel Hampton', 'arogers@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(181, 'Vincent Jackson', 'michael83@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(182, 'Darlene Bautista', 'heidi34@yahoo.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(183, 'Ashley Kelley', 'ymiller@chandler-ritter.info', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(184, 'Natalie Odonnell', 'patricia77@johnson.biz', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(185, 'Amy Roberson', 'holly77@salinas.net', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(186, 'Krista Lee', 'johnfleming@reynolds.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(187, 'Nicholas Bryant', 'jared58@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(188, 'Dr. Michael Davis', 'hlee@brown.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(189, 'Beth Washington', 'valerie04@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(190, 'Sydney Boyd', 'george03@watkins-rivera.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(191, 'Lee Owens', 'kaylabailey@gilbert-ball.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(192, 'Erin Brown', 'gprice@bullock-sanchez.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(193, 'Jessica Vazquez', 'flynnmark@mercado.org', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(194, 'Ryan Foster', 'jenniferwebb@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(195, 'Matthew Anderson', 'duarterachael@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(196, 'Barbara Cox', 'pwallace@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(197, 'Anna Coleman', 'gonzalezdavid@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(198, 'Jacqueline Hartman', 'tsmith@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(199, 'Rachel Conway', 'justinbrewer@williams-stephens.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(200, 'Jessica Good', 'nelsonjacob@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(201, 'Gary Howard', 'timothycopeland@clark.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(202, 'Melissa Mcdaniel', 'vharrison@snow-stewart.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(203, 'Christopher Joseph', 'thomasspencer@reynolds.info', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(204, 'Amanda Martinez', 'jamie11@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(205, 'Travis Rasmussen', 'jhines@torres.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(206, 'William Morris', 'aaron28@ross.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(207, 'Jason Roberts', 'danny26@yahoo.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(208, 'Jared Sparks', 'eball@powell-ramirez.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(209, 'Angela Johnson', 'lbrown@lewis-turner.biz', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(210, 'Alexander Flores', 'gfry@ramirez.biz', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(211, 'Warren Richmond', 'ramosbrendan@rosales-may.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(212, 'Rebecca Espinoza', 'suzannelee@bishop-cox.info', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(213, 'Susan Boyd', 'zachary01@becker.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(214, 'Brandon Brooks', 'theresa19@yahoo.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(215, 'Nicole Lopez', 'ibailey@hotmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(216, 'Todd Johnson', 'alexanderwilkins@gmail.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(217, 'Heather Rogers', 'dwilliams@brown-bates.com', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(218, 'Jessica Sweeney', 'mark25@reed-calhoun.info', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473', 'supervisor', NULL, '2025-05-06 17:41:07', '2025-05-06 17:41:07', NULL),
(219, 'ranim', 'ranim1@example.com', NULL, '$2y$12$Yf4uYF.FPCVfWNEldiiXA.vvNrslI1m2AP5/cKQnjdxv54P/5T.cm', 'student', NULL, '2025-05-21 23:30:24', '2025-05-21 23:30:24', NULL),
(220, 'معاذ', 'm@example.com', NULL, '$2y$12$m6kRa2JNZyMoDa0jAkJEvuYxtI6Ru4pW0wxWkqxtpKRWd.wd7aShG', 'student', NULL, '2025-05-22 00:59:51', '2025-05-22 00:59:51', NULL),
(221, 'jad', 'm3@example.com', NULL, '$2y$12$HYOJZU1MAxtHHrsyx0VgFu1y6TOyyi/8QuOvdZLIvmQPO9olcw3xK', 'student', NULL, '2025-05-22 01:31:07', '2025-05-22 01:31:07', NULL),
(222, 'رنيم', 'ranim4@example.com', NULL, '$2y$12$tsflthAavyiTPe6Z/I8VFuLxEPa.G/UtNWAp44DMBuMpHhXcUwza.', 'student', NULL, '2025-05-23 04:12:17', '2025-05-23 04:12:17', NULL),
(223, 'رنيم', 'ranim5@example.com', NULL, '$2y$12$Qb5iBttZeqfBVWosEkgxpu9GnqH7YRUhDgvV1Z7C2WcJ7X./1uVRK', 'student', NULL, '2025-05-23 04:47:50', '2025-05-23 04:47:50', NULL),
(224, 'luhq', 'm7@example.com', NULL, '$2y$12$0.j4Ho.LbhidjqMNuQXpouqfXk.1hh5W9Rn2Bfc08RGRC2iJSr9oi', 'student', NULL, '2025-05-23 04:50:31', '2025-05-23 04:50:31', NULL),
(225, 'رنيم', 'ranim6@example.com', '+963931654106', '$2y$12$T2IjbRYSgTtcACFrKhUdRuCgzYZ93/2p.21.9hBtFzCOWQhODu5/.', 'student', NULL, '2025-05-23 12:20:03', '2025-05-23 12:20:03', NULL),
(226, 'jad', 'm10@example.com', '+963955009595', '$2y$12$pM6lbdUq9CChulD7BE5Ac.Gnysr4RwlO.CoT.NO1c5.jFa/y1PSaS', 'student', NULL, '2025-05-23 16:31:05', '2025-05-23 16:31:05', NULL),
(227, 'رنيم', 'ranim50@example.com', NULL, '$2y$12$6GtSaRAjgFsHKNZt2AT6WOitCS9NWi6M3cQ6jCXcq8VfHLx5q9eUG', 'student', NULL, '2025-05-23 17:11:56', '2025-05-23 17:11:56', NULL),
(228, 'يش', 'm12@example.com', NULL, '$2y$12$G8rXbUxA9hZ.bw.Sol/ZRe7u71L9tNolMWVl2Qexq6i.A9AoIXqb2', 'student', NULL, '2025-05-23 17:44:56', '2025-05-23 17:44:56', NULL),
(229, 'ةبيسنبة', 'badmin@example.com', NULL, '$2y$12$0IVQ7bm9Q3uHJpqNX5JQPek2Q8juAXmqCt2VznKI/x9LomGUA4zSC', 'student', NULL, '2025-05-23 18:25:53', '2025-05-23 18:25:53', NULL),
(230, 'رنيم', 'ranim51@example.com', '+963955009596', '$2y$12$5QMwRK5Cf2fkldt6HpG0MuhjX1/HmJhCJwFFgWvCKOcrb8EtKfHkC', 'student', NULL, '2025-05-24 00:31:31', '2025-05-24 00:31:31', NULL),
(231, 'Muhammad Mouaz Al Khawam', 'm11@example.com', '+963955009597', '$2y$12$l0dLu41m4Fz11jh7.zOob.SiMziSRYO0v5EQQcoeIO32jX5cAPw7W', 'student', NULL, '2025-05-24 05:00:23', '2025-05-24 05:00:23', NULL),
(232, 'Muhammad Mouaz Al Khawam', 'jjj@example.com', '+963955009598', '$2y$12$oBpPnbz8YnSYwcHMO4QqIODptc4XztQdl2E0qf53C4HxlRPXbPjBW', 'student', NULL, '2025-05-28 04:56:34', '2025-05-28 04:56:34', NULL),
(233, 'Muhammad Mouaz Al Khawam', 'dabis@example.com', '+963955009599', '$2y$12$ivwIiRloRzIhl16l.7/flOjwCYRFmovf9RmRlJL/SCu4STV2DHcue', 'student', NULL, '2025-05-29 05:47:09', '2025-05-29 05:47:09', NULL),
(234, 'jad', 'dabis@gmail.com', '+9639550095910', '$2y$12$Puf2do.SoZhCW/l.9MR99eGg.Xa6fZSjqLGEx5wsBtgxTFXcqE5m6', 'student', NULL, '2025-05-29 06:18:37', '2025-05-29 06:18:37', NULL),
(235, 'jad', 'dabis@kk.com', '+9639550095912', '$2y$12$5Wy3ol6tBo2lW04hzXsbWOCUiQ81qvSfV/i58hRPligCnsVS2rqie', 'student', NULL, '2025-05-29 06:19:29', '2025-05-29 06:19:29', NULL),
(236, 'محمد معاذ الخوام', 'alkhawammouaz@gmail.com', '+963956904264', '$2y$12$wm2mwAru.mShyG6.Xw31PurzBBUjcBD.Y036UfGr72Zw/JbFCLHIG', 'student', NULL, '2025-05-29 06:21:12', '2025-05-29 06:21:12', NULL),
(237, 'محمد معاذ الخوام', 'mouazalkhawam@gmail.com', '0955009595', '$2y$12$05dNg3FbW2MBR663DNfgReyIu/k9RIZDUmUdwzkLiYS4nw9vwSmC.', 'student', NULL, '2025-05-29 06:43:01', '2025-05-29 06:43:01', NULL),
(238, 'معاذ', 'khaled@example.com', '+96395500959666', '$2y$12$mjjTitHQDGDuMzQAnWrqOuyczNthaaYMG7LLw8DqXKsSP9hBb15yW', 'student', NULL, '2025-05-29 06:52:07', '2025-05-29 06:52:07', NULL),
(239, 'معاذ', 'jajfnjand@jsndfnfa.com', 'andDSMFKL', '$2y$12$TaARkRhpzJhTn0ITNgzPvu75mIZXWcZuWguYZC4JIKTJcqtcq4G96', 'student', NULL, '2025-05-29 06:57:04', '2025-05-29 06:57:04', NULL),
(240, ',laaf;lmkfm', 'msdaflmla@msdflfmms.com', 'mfsdlmsd`', '$2y$12$/hhpaB.DuHBWIiR2LRl/IeIUtf718ycJnFHSWDEZU.aUkeChhOJMG', 'student', 'profile_pictures/P4Ir1evqQ96NdsIvfrZllISAyfYlB7rRIebVOijQ.jpg', '2025-05-29 07:52:52', '2025-05-29 07:52:52', NULL),
(241, 'audshuh', 'dahnasdn@msfdjndsjfn.cpm', 'dshfnnadf', '$2y$12$MvM0BqIB5Z/9SJxfEYPs9OAedTsL8y4PyFVSU7CDR2GPo2CDujsZW', 'student', 'profile_pictures/lOiuqwuI6HX9YzSdKP35zUvFEWOHjyNhVtuJKF7r.png', '2025-05-29 08:34:17', '2025-05-29 08:34:17', NULL),
(242, 'Muhammad Mouaz Al Khawam', 'kadjlf@sndjfnk.com', 'sdnfgn`nn`', '$2y$12$ApJ1fMgqaqssidUvC1IYAOaOSj5NHaOB25m8aaUNq.JVVUfok2tTa', 'student', 'images/users/1748521305.jpg', '2025-05-29 09:21:45', '2025-05-29 09:21:45', NULL),
(243, 'Muhammad Mouaz Al Khawam', 'jjjjj@example.com', '+9639550095988', '$2y$12$ka4lCQ7agje//8KL4nwcle9uc.Jztj3lN3vI835m0MRP6wOsPxAg2', 'student', 'images/users/1748806827.png', '2025-06-01 16:40:27', '2025-06-01 16:40:27', NULL),
(244, 'خالد', 'khaled33@example.com', '+9639550095999', '$2y$12$JiMnZVenjjEZ3gPKwKuTgeGsgzBAROEkKh8Xro9EppRa16qU8ECFi', 'student', 'images/users/1748807206.png', '2025-06-01 16:46:46', '2025-06-01 16:46:46', NULL),
(245, 'خالد', 'khaled33333@example.com', '+963955009599999', '$2y$12$m5ufA0Dx/UmD6uKg0dJU1Ok4oe2e1LkOv3e/FnT2TXe.7rKHJApjO', 'student', 'images/users/1748807261.png', '2025-06-01 16:47:41', '2025-06-01 16:47:41', NULL),
(246, 'معاذ', 'ttt@ttt.com', '545464646464654', '$2y$12$.1hNBzil5CB0Zx5bsRKqKOeIAx3UdvABwTpUauE1wQ6OSo.jrPVoC', 'student', 'images/users/1748807315.png', '2025-06-01 16:48:35', '2025-06-01 16:48:35', NULL),
(247, 'Muhammad Mouaz Al Khawam', 'madlkdmklmad@ksfkkdsnfs.com', '+9639550095935', '$2y$12$Iay7TOGkmjgxd9ucY75G5u14opXg8crEt8y6B.gJDj4fctGL5GNmy', 'student', 'images/users/1748876826.png', '2025-06-02 12:07:06', '2025-06-02 12:07:06', NULL),
(248, 'dsfkldfkla', 'admin555@example.com', '+96395500959595', '$2y$12$Xi3TS00pFDUjlevxbXcUq.0hR40uneI4DPZYjdBUwo3HM0sPIyKwW', 'student', 'images/users/1748892990.png', '2025-06-02 16:36:30', '2025-06-02 16:36:30', NULL),
(249, 'معاذ', 'afgot2002@gmail.com', '+963945009595', '$2y$12$03HnXPnj4rf/Gogn6oxGPOwyKpLeizlmLD6XmK9NYp9k154RRCUY2', 'student', 'images/users/1748894614.png', '2025-06-02 17:03:34', '2025-06-02 17:03:34', NULL),
(250, 'جمال', 'jamal@example.com', '+963956704264', '$2y$12$eW4raDmoxUEZrkezsqUC6u4aDR30QR8q1B7sEmBuA.A8Tch79GpHa', 'student', 'images/users/1748895297.png', '2025-06-02 17:14:58', '2025-06-02 17:14:58', NULL),
(251, 'jad', 'jadd@example.com', '+96319540045', '$2y$12$UUp.xvo99gYoTwBuAornP.BPbztrT5F53rsnFYhuocl5EzZx9VgoS', 'student', 'images/users/1748895446.png', '2025-06-02 17:17:26', '2025-06-02 17:17:26', NULL),
(252, 'jad', 'sara@example.com', '+963955007595', '$2y$12$DFxVr1P0K7F8qlwH8/YBMuQCJ8hmQiX7yO23s1MSkjoi1RP.vZNDe', 'student', 'images/users/1748898760.png', '2025-06-02 18:12:40', '2025-06-02 18:12:40', NULL),
(253, 'dalaa', 'dalaa@example.com', '+9666005543', '$2y$12$GxOZARXvwSy2HRFVSzH1KuuRdyafxt6olDyZWjwUni8CrejxUw3mi', 'student', 'images/users/1748929046.png', '2025-06-03 02:37:26', '2025-06-03 02:37:26', NULL),
(254, 'تحسين', 'tahsen@example.com', '+95500454540', '$2y$12$pgZTjAvT9Q8sLVjANeaQQOjYz11.rLSimKlFG.NJduf3nR3e7R2M6', 'student', 'images/users/1748933431.png', '2025-06-03 03:50:32', '2025-06-03 03:50:32', NULL),
(255, 'Muhammad Mouaz Al Khawam', 'admin55656@example.com', '+966545105845', '$2y$12$j2Av1iPsc6cgPLTt3brxzuKx/gblbbj13yMxyMuFpt4JUiwWV6OJK', 'student', 'images/users/1748940777.png', '2025-06-03 05:52:57', '2025-06-03 05:52:57', NULL),
(256, 'محمد تحسين الشربشلي', 'tahseeen@example.com', '+988512442054', '$2y$12$DGgTD8n9dJ1RAtR04C0hLex87t8dW/lwB/nvFhZfcjgA6Qs4Pe28a', 'student', 'images/users/1749125167.png', '2025-06-05 09:06:07', '2025-06-05 09:06:07', NULL),
(257, 'هادي', 'hadi@example.com', '+96454500150', '$2y$12$i0lLgat7dS6T62WXY3k7luob7nyz0jz9q1BIc4lrCA.AaXAsxK0V.', 'student', 'images/users/1749263834.png', '2025-06-06 23:37:16', '2025-06-06 23:37:16', NULL),
(258, 'سمستر', 'semester@example.com', '+963944351943', '$2y$12$4bi9RHrsynz0jrLc4ZWbFuywZ9.i36xaUgUxPQq/2SgOPy1KL7.tS', 'student', 'images/users/1749315910.jpg', '2025-06-07 14:05:10', '2025-06-07 14:05:10', NULL),
(259, 'saher', 'saher@example.com', '+966002524200', '$2y$12$pFPtnCmCkcRYI/ejT38RU.g85VCHbKHNHwTE5Ym3deOGRgL7sImWm', 'student', 'images/users/1749353070.png', '2025-06-08 00:24:30', '2025-06-08 00:24:30', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_periods`
--
ALTER TABLE `academic_periods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `academic_period_project`
--
ALTER TABLE `academic_period_project`
  ADD KEY `academic_period_project_academic_period_id_foreign` (`academic_period_id`),
  ADD KEY `academic_period_project_project_projectid_foreign` (`project_projectid`);

--
-- Indexes for table `alumni`
--
ALTER TABLE `alumni`
  ADD PRIMARY KEY (`alumniId`),
  ADD KEY `alumni_userid_foreign` (`userId`);

--
-- Indexes for table `department_heads`
--
ALTER TABLE `department_heads`
  ADD PRIMARY KEY (`headId`),
  ADD KEY `department_heads_userid_foreign` (`userId`);

--
-- Indexes for table `evaluation_criteria`
--
ALTER TABLE `evaluation_criteria`
  ADD PRIMARY KEY (`criteria_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`groupid`),
  ADD KEY `groups_projectid_foreign` (`projectid`);

--
-- Indexes for table `group_student`
--
ALTER TABLE `group_student`
  ADD PRIMARY KEY (`studentId`,`groupid`),
  ADD KEY `group_student_groupid_foreign` (`groupid`);

--
-- Indexes for table `group_supervisor`
--
ALTER TABLE `group_supervisor`
  ADD PRIMARY KEY (`supervisorId`,`groupid`),
  ADD KEY `group_supervisor_groupid_foreign` (`groupid`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meetings_group_id_foreign` (`group_id`),
  ADD KEY `meetings_leader_id_foreign` (`leader_id`),
  ADD KEY `meetings_supervisor_id_foreign` (`supervisor_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `peer_evaluations`
--
ALTER TABLE `peer_evaluations`
  ADD PRIMARY KEY (`evaluation_id`),
  ADD KEY `peer_evaluations_evaluator_user_id_foreign` (`evaluator_user_id`),
  ADD KEY `peer_evaluations_evaluated_user_id_foreign` (`evaluated_user_id`),
  ADD KEY `peer_evaluations_group_id_foreign` (`group_id`),
  ADD KEY `peer_evaluations_criteria_id_foreign` (`criteria_id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`projectid`),
  ADD KEY `projects_headid_foreign` (`headid`);

--
-- Indexes for table `project_coordinators`
--
ALTER TABLE `project_coordinators`
  ADD PRIMARY KEY (`coordinatorId`),
  ADD KEY `project_coordinators_userid_foreign` (`userId`);

--
-- Indexes for table `project_proposals`
--
ALTER TABLE `project_proposals`
  ADD PRIMARY KEY (`proposalId`),
  ADD KEY `project_proposals_group_id_foreign` (`group_id`);

--
-- Indexes for table `project_stages`
--
ALTER TABLE `project_stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_stages_project_id_foreign` (`project_id`);

--
-- Indexes for table `proposal_experts`
--
ALTER TABLE `proposal_experts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_experts_proposal_id_foreign` (`proposal_id`);

--
-- Indexes for table `proposal_supervisors`
--
ALTER TABLE `proposal_supervisors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_supervisors_proposal_id_foreign` (`proposal_id`),
  ADD KEY `proposal_supervisors_supervisor_id_foreign` (`supervisor_id`);

--
-- Indexes for table `proposal_team_members`
--
ALTER TABLE `proposal_team_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_team_members_proposal_id_foreign` (`proposal_id`),
  ADD KEY `proposal_team_members_student_id_foreign` (`student_id`);

--
-- Indexes for table `resources`
--
ALTER TABLE `resources`
  ADD PRIMARY KEY (`resourceId`),
  ADD KEY `resources_created_by_foreign` (`created_by`),
  ADD KEY `resources_reviewed_by_foreign` (`reviewed_by`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`scheduledId`),
  ADD KEY `schedules_group_id_foreign` (`group_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `skill_student`
--
ALTER TABLE `skill_student`
  ADD PRIMARY KEY (`id`),
  ADD KEY `skill_student_student_id_foreign` (`student_id`),
  ADD KEY `skill_student_skill_id_foreign` (`skill_id`);

--
-- Indexes for table `stage_submissions`
--
ALTER TABLE `stage_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stage_submissions_project_stage_id_foreign` (`project_stage_id`),
  ADD KEY `stage_submissions_reviewed_by_foreign` (`reviewed_by`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`studentId`),
  ADD KEY `students_userid_foreign` (`userId`);

--
-- Indexes for table `supervisors`
--
ALTER TABLE `supervisors`
  ADD PRIMARY KEY (`supervisorId`),
  ADD KEY `supervisors_userid_foreign` (`userId`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tasks_project_stage_id_foreign` (`project_stage_id`),
  ADD KEY `tasks_assigned_to_foreign` (`assigned_to`),
  ADD KEY `tasks_assigned_by_foreign` (`assigned_by`);

--
-- Indexes for table `task_submissions`
--
ALTER TABLE `task_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_submissions_task_id_foreign` (`task_id`),
  ADD KEY `task_submissions_studentid_foreign` (`studentId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_periods`
--
ALTER TABLE `academic_periods`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `alumni`
--
ALTER TABLE `alumni`
  MODIFY `alumniId` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `department_heads`
--
ALTER TABLE `department_heads`
  MODIFY `headId` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_criteria`
--
ALTER TABLE `evaluation_criteria`
  MODIFY `criteria_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `groupid` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `peer_evaluations`
--
ALTER TABLE `peer_evaluations`
  MODIFY `evaluation_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `projectid` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `project_coordinators`
--
ALTER TABLE `project_coordinators`
  MODIFY `coordinatorId` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `project_proposals`
--
ALTER TABLE `project_proposals`
  MODIFY `proposalId` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `project_stages`
--
ALTER TABLE `project_stages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `proposal_experts`
--
ALTER TABLE `proposal_experts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposal_supervisors`
--
ALTER TABLE `proposal_supervisors`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposal_team_members`
--
ALTER TABLE `proposal_team_members`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resources`
--
ALTER TABLE `resources`
  MODIFY `resourceId` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `scheduledId` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `skill_student`
--
ALTER TABLE `skill_student`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=550;

--
-- AUTO_INCREMENT for table `stage_submissions`
--
ALTER TABLE `stage_submissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `studentId` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

--
-- AUTO_INCREMENT for table `supervisors`
--
ALTER TABLE `supervisors`
  MODIFY `supervisorId` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `task_submissions`
--
ALTER TABLE `task_submissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userId` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=260;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `academic_period_project`
--
ALTER TABLE `academic_period_project`
  ADD CONSTRAINT `academic_period_project_academic_period_id_foreign` FOREIGN KEY (`academic_period_id`) REFERENCES `academic_periods` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `academic_period_project_project_projectid_foreign` FOREIGN KEY (`project_projectid`) REFERENCES `projects` (`projectid`) ON DELETE CASCADE;

--
-- Constraints for table `alumni`
--
ALTER TABLE `alumni`
  ADD CONSTRAINT `alumni_userid_foreign` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `department_heads`
--
ALTER TABLE `department_heads`
  ADD CONSTRAINT `department_heads_userid_foreign` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_projectid_foreign` FOREIGN KEY (`projectid`) REFERENCES `projects` (`projectid`) ON DELETE CASCADE;

--
-- Constraints for table `group_student`
--
ALTER TABLE `group_student`
  ADD CONSTRAINT `group_student_groupid_foreign` FOREIGN KEY (`groupid`) REFERENCES `groups` (`groupid`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_student_studentid_foreign` FOREIGN KEY (`studentId`) REFERENCES `students` (`studentId`) ON DELETE CASCADE;

--
-- Constraints for table `group_supervisor`
--
ALTER TABLE `group_supervisor`
  ADD CONSTRAINT `group_supervisor_groupid_foreign` FOREIGN KEY (`groupid`) REFERENCES `groups` (`groupid`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_supervisor_supervisorid_foreign` FOREIGN KEY (`supervisorId`) REFERENCES `supervisors` (`supervisorId`) ON DELETE CASCADE;

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `meetings_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `groups` (`groupid`) ON DELETE CASCADE,
  ADD CONSTRAINT `meetings_leader_id_foreign` FOREIGN KEY (`leader_id`) REFERENCES `students` (`studentId`) ON DELETE CASCADE,
  ADD CONSTRAINT `meetings_supervisor_id_foreign` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`supervisorId`) ON DELETE CASCADE;

--
-- Constraints for table `peer_evaluations`
--
ALTER TABLE `peer_evaluations`
  ADD CONSTRAINT `peer_evaluations_criteria_id_foreign` FOREIGN KEY (`criteria_id`) REFERENCES `evaluation_criteria` (`criteria_id`),
  ADD CONSTRAINT `peer_evaluations_evaluated_user_id_foreign` FOREIGN KEY (`evaluated_user_id`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `peer_evaluations_evaluator_user_id_foreign` FOREIGN KEY (`evaluator_user_id`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `peer_evaluations_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `groups` (`groupid`);

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_headid_foreign` FOREIGN KEY (`headid`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `project_coordinators`
--
ALTER TABLE `project_coordinators`
  ADD CONSTRAINT `project_coordinators_userid_foreign` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `project_proposals`
--
ALTER TABLE `project_proposals`
  ADD CONSTRAINT `project_proposals_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `groups` (`groupid`) ON DELETE CASCADE;

--
-- Constraints for table `project_stages`
--
ALTER TABLE `project_stages`
  ADD CONSTRAINT `project_stages_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`projectid`) ON DELETE CASCADE;

--
-- Constraints for table `proposal_experts`
--
ALTER TABLE `proposal_experts`
  ADD CONSTRAINT `proposal_experts_proposal_id_foreign` FOREIGN KEY (`proposal_id`) REFERENCES `project_proposals` (`proposalId`) ON DELETE CASCADE;

--
-- Constraints for table `proposal_supervisors`
--
ALTER TABLE `proposal_supervisors`
  ADD CONSTRAINT `proposal_supervisors_proposal_id_foreign` FOREIGN KEY (`proposal_id`) REFERENCES `project_proposals` (`proposalId`) ON DELETE CASCADE,
  ADD CONSTRAINT `proposal_supervisors_supervisor_id_foreign` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`supervisorId`) ON DELETE CASCADE;

--
-- Constraints for table `proposal_team_members`
--
ALTER TABLE `proposal_team_members`
  ADD CONSTRAINT `proposal_team_members_proposal_id_foreign` FOREIGN KEY (`proposal_id`) REFERENCES `project_proposals` (`proposalId`) ON DELETE CASCADE,
  ADD CONSTRAINT `proposal_team_members_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`studentId`) ON DELETE CASCADE;

--
-- Constraints for table `resources`
--
ALTER TABLE `resources`
  ADD CONSTRAINT `resources_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `resources_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`userId`);

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `groups` (`groupid`) ON DELETE CASCADE;

--
-- Constraints for table `skill_student`
--
ALTER TABLE `skill_student`
  ADD CONSTRAINT `skill_student_skill_id_foreign` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `skill_student_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`studentId`) ON DELETE CASCADE;

--
-- Constraints for table `stage_submissions`
--
ALTER TABLE `stage_submissions`
  ADD CONSTRAINT `stage_submissions_project_stage_id_foreign` FOREIGN KEY (`project_stage_id`) REFERENCES `project_stages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stage_submissions_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`userId`) ON DELETE SET NULL;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_userid_foreign` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `supervisors`
--
ALTER TABLE `supervisors`
  ADD CONSTRAINT `supervisors_userid_foreign` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`userId`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `students` (`studentId`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_project_stage_id_foreign` FOREIGN KEY (`project_stage_id`) REFERENCES `project_stages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_submissions`
--
ALTER TABLE `task_submissions`
  ADD CONSTRAINT `task_submissions_studentid_foreign` FOREIGN KEY (`studentId`) REFERENCES `students` (`studentId`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_submissions_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
